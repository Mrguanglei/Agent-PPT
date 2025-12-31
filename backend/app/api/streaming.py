"""
SSE Streaming API Routes
"""
import json
import asyncio
from typing import AsyncGenerator
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.chat import Chat
from app.models.user import User
from app.api.deps import get_current_active_user, get_current_user_from_token
from app.utils.redis_client import redis_client

router = APIRouter()


@router.get("/agent/{agent_run_id}")
async def stream_agent_response(
    agent_run_id: str,
    current_user: User = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db),
):
    """
    SSE endpoint for streaming agent response

    This endpoint provides real-time updates as the agent processes the request.
    Events include:
    - message: Text content chunks
    - tool_call_start: Tool invocation started
    - tool_call_progress: Tool execution progress
    - tool_call_complete: Tool execution finished
    - slide_update: New slide generated
    - done: Agent completed
    - error: Error occurred

    Connection will stay open until agent finishes or error occurs.
    """

    async def event_generator() -> AsyncGenerator[str, None]:
        """Generate SSE events"""
        channel = f"agent_run:{agent_run_id}"
        pubsub = None

        try:
            # Subscribe to Redis channel
            pubsub = await redis_client.subscribe(channel)

            # Send initial connection event
            yield f"event: connected\ndata: {json.dumps({'agent_run_id': agent_run_id})}\n\n"

            # Listen for messages
            while True:
                try:
                    # Get message with timeout
                    message = await pubsub.get_message(
                        ignore_subscribe_messages=True,
                        timeout=1  # Use a small timeout to allow cleanup
                    )

                    if message and message['type'] == 'message':
                        data = json.loads(message['data'])

                        # Send SSE event
                        event_type = data.get('type', 'message')
                        payload = data.get('payload', {})

                        yield f"event: {event_type}\ndata: {json.dumps(payload)}\n\n"

                        # Check for completion
                        if event_type == 'done' or event_type == 'error':
                            break

                    # Small delay to prevent busy loop
                    await asyncio.sleep(0.01)

                except asyncio.CancelledError:
                    # Client disconnected
                    break
                except Exception as e:
                    # Send error event
                    yield f"event: error\ndata: {json.dumps({'message': str(e)})}\n\n"
                    break

        except Exception as e:
            yield f"event: error\ndata: {json.dumps({'message': f'Streaming error: {str(e)}'})}\n\n"

        finally:
            # Cleanup
            if pubsub:
                await pubsub.unsubscribe(channel)
                await pubsub.close()

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # Disable nginx buffering
        },
    )


@router.get("/chats/{chat_id}")
async def stream_chat_updates(
    chat_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    SSE endpoint for streaming chat updates

    Provides real-time updates for a specific chat.
    Events include:
    - message: New message
    - slide_update: Slide generated/updated
    - status_change: Chat status changed
    """

    # Validate chat ownership
    result = await db.execute(
        select(Chat).where(Chat.id == chat_id, Chat.user_id == current_user.id)
    )
    chat = result.scalar_one_or_none()

    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found",
        )

    async def event_generator() -> AsyncGenerator[str, None]:
        """Generate chat update events"""
        channel = f"chat_updates:{chat_id}"
        pubsub = None

        try:
            pubsub = await redis_client.subscribe(channel)

            yield f"event: connected\ndata: {json.dumps({'chat_id': chat_id})}\n\n"

            while True:
                try:
                    message = await pubsub.get_message(
                        ignore_subscribe_messages=True,
                        timeout=1  # Use a small timeout to allow cleanup
                    )

                    if message and message['type'] == 'message':
                        data = json.loads(message['data'])
                        event_type = data.get('type', 'update')

                        yield f"event: {event_type}\ndata: {json.dumps(data.get('payload', {}))}\n\n"

                    await asyncio.sleep(0.01)

                except asyncio.CancelledError:
                    break
                except Exception as e:
                    yield f"event: error\ndata: {json.dumps({'message': str(e)})}\n\n"
                    break

        finally:
            if pubsub:
                await pubsub.unsubscribe(channel)
                await pubsub.close()

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
