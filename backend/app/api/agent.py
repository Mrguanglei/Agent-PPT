"""
Agent API Routes
"""
import uuid
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.chat import Chat, ChatStatus
from app.models.message import Message, MessageRole
from app.models.user import User
from app.schemas.agent import AgentRunRequest, AgentRunResponse
from app.schemas.message import MessageCreate
from app.api.deps import get_current_active_user
from app.utils.redis_client import redis_client
from app.config import settings

router = APIRouter()


@router.post("/run", response_model=AgentRunResponse)
async def run_agent(
    request: AgentRunRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Run the PPT Agent with a user message

    This endpoint:
    1. Creates a new chat (if chat_id not provided)
    2. Saves the user message
    3. Triggers the Agent Worker (via Dramatiq)
    4. Returns agent_run_id for SSE streaming

    - **chat_id**: Existing chat ID (optional, creates new chat if not provided)
    - **message**: User message content
    - **model**: OpenAI model to use (optional, defaults to configured model)
    """
    # Get or create chat
    chat: Chat
    if request.chat_id:
        # Validate chat ownership
        result = await db.execute(
            select(Chat).where(Chat.id == request.chat_id, Chat.user_id == current_user.id)
        )
        chat = result.scalar_one_or_none()
        if not chat:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat not found",
            )
    else:
        # Create new chat with auto-generated title
        chat = Chat(
            user_id=current_user.id,
            title=request.message[:50] + "..." if len(request.message) > 50 else request.message,
            status=ChatStatus.GENERATING,
        )
        db.add(chat)
        await db.flush()

    # Update chat status
    chat.status = ChatStatus.GENERATING

    # Create user message
    user_message = Message(
        chat_id=chat.id,
        role=MessageRole.USER,
        content=request.message,
    )
    db.add(user_message)

    # Generate agent run ID
    agent_run_id = str(uuid.uuid4())

    # Commit to database
    await db.commit()

    # Publish to Redis for worker to pick up
    await redis_client.publish(
        "agent_runs",
        {
            "agent_run_id": agent_run_id,
            "chat_id": str(chat.id),
            "user_id": str(current_user.id),
            "message": request.message,
            "model": request.model or settings.openai_model,
        }
    )

    return AgentRunResponse(
        agent_run_id=agent_run_id,
        chat_id=str(chat.id),
        status="started",
    )


@router.post("/stop")
async def stop_agent(
    agent_run_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Stop a running agent

    - **agent_run_id**: The agent run ID to stop
    """
    # Publish stop event to Redis
    await redis_client.publish(
        f"agent_stop:{agent_run_id}",
        {"user_id": str(current_user.id), "action": "stop"}
    )

    return {"message": "Stop signal sent", "agent_run_id": agent_run_id}


@router.get("/history/{chat_id}")
async def get_chat_history(
    chat_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Get chat history for a specific chat

    Returns all messages in chronological order.
    """
    # Validate chat ownership
    result = await db.execute(
        select(Chat)
        .where(Chat.id == chat_id, Chat.user_id == current_user.id)
        .options(selectinload(Chat.messages))
    )
    chat = result.scalar_one_or_none()

    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found",
        )

    # Format messages for OpenAI API
    messages = []
    for msg in chat.messages:
        messages.append({
            "role": msg.role.value,
            "content": msg.content,
        })

    return {
        "chat_id": str(chat.id),
        "messages": messages,
    }
