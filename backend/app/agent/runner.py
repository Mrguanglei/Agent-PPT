"""
Agent Runner - Main Agent execution logic
"""
import asyncio
import json
import time
from typing import List, Dict, Any, AsyncGenerator
from openai import AsyncOpenAI

from app.config import settings
from app.agent.prompts import SYSTEM_PROMPT
from app.agent.tools.registry import TOOLS_DEFINITIONS, execute_tool
from app.utils.redis_client import redis_client
from app.database import async_session_maker
from app.models.message import Message, MessageRole
from app.models.chat import Chat
from app.models.tool_call import ToolCall, ToolCallStatus
from sqlalchemy import select


class AgentRunner:
    """PPT Agent Runner - Handles OpenAI interaction and tool execution"""

    def __init__(self, agent_run_id: str, chat_id: str, user_id: str, session_maker=None):
        self.agent_run_id = agent_run_id
        self.chat_id = chat_id
        self.user_id = user_id
        self.session_maker = session_maker or async_session_maker

        # 初始化 OpenAI 客户端，支持国产模型的自定义 base_url
        client_kwargs = {"api_key": settings.openai_api_key}
        if settings.openai_base_url:
            client_kwargs["base_url"] = settings.openai_base_url

        self.client = AsyncOpenAI(**client_kwargs)
        self.channel = f"agent_run:{agent_run_id}"
        self.is_stopped = False

    async def _publish(self, event_type: str, payload: dict) -> None:
        """Publish SSE event to Redis"""
        await redis_client.publish(
            self.channel,
            json.dumps({"type": event_type, "payload": payload})
        )

    async def _listen_for_stop(self) -> None:
        """Listen for stop signal"""
        stop_channel = f"agent_stop:{self.agent_run_id}"
        pubsub = await redis_client.subscribe(stop_channel)
        try:
            async for message in pubsub.listen():
                if self.is_stopped:  # Check flag before processing
                    break
                if message['type'] == 'message':
                    data = json.loads(message['data'])
                    if data.get('action') == 'stop':
                        self.is_stopped = True
                        break
        except asyncio.CancelledError:
            # Task was cancelled, exit gracefully
            pass
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning(f"Stop listener error: {e}")
        finally:
            try:
                # Don't close pubsub if it's still being iterated
                # Just unsubscribe and let it clean up naturally
                await pubsub.unsubscribe(stop_channel)
            except asyncio.CancelledError:
                pass
            except Exception:
                pass  # Ignore cleanup errors

    async def get_history(self) -> List[Dict[str, str]]:
        """Get conversation history from database"""
        async with self.session_maker() as db:
            result = await db.execute(
                select(Message)
                .where(Message.chat_id == self.chat_id)
                .order_by(Message.created_at)
            )
            messages = result.scalars().all()

            return [
                {"role": msg.role.value, "content": msg.content}
                for msg in messages
            ]

    async def save_message(self, role: MessageRole, content: str) -> Message:
        """Save a message to the database"""
        async with self.session_maker() as db:
            message = Message(
                chat_id=self.chat_id,
                role=role,
                content=content,
            )
            db.add(message)
            await db.commit()
            await db.refresh(message)
            return message

    async def save_tool_call(self, tool_call_id: str, tool_name: str, params: dict = None,
                           status: ToolCallStatus = ToolCallStatus.PENDING,
                           result: dict = None, execution_time: float = None,
                           error_message: str = None, message_id: str = None) -> ToolCall:
        """Save or update a tool call to the database"""
        async with self.session_maker() as db:
            # Try to find existing tool call
            existing_tool_call = None
            if tool_call_id:
                result_query = await db.execute(
                    select(ToolCall).where(
                        ToolCall.chat_id == self.chat_id,
                        ToolCall.tool_call_id == tool_call_id
                    )
                )
                existing_tool_call = result_query.scalar_one_or_none()

            if existing_tool_call:
                # Update existing tool call
                existing_tool_call.status = status
                if result is not None:
                    existing_tool_call.tool_result = result
                if execution_time is not None:
                    existing_tool_call.execution_time = execution_time
                if error_message is not None:
                    existing_tool_call.error_message = error_message
                if message_id is not None:
                    existing_tool_call.message_id = message_id
                tool_call = existing_tool_call
            else:
                # Create new tool call
                tool_call = ToolCall(
                    chat_id=self.chat_id,
                    message_id=message_id,
                    tool_name=tool_name,
                    tool_params=params,
                    tool_result=result,
                    status=status,
                    execution_time=execution_time,
                    error_message=error_message,
                    tool_call_id=tool_call_id,
                )
                db.add(tool_call)

            await db.commit()
            await db.refresh(tool_call)
            return tool_call

    async def run(self, user_message: str) -> None:
        """Execute the Agent conversation loop"""

        # Save user message
        await self.save_message(MessageRole.USER, user_message)

        # Get conversation history
        history = await self.get_history()

        # Build messages for OpenAI
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT}
        ] + history

        # Track tool calls
        tool_calls_buffer = {}

        try:
            # Start listening for stop signal
            stop_task = asyncio.create_task(self._listen_for_stop())

            # Main conversation loop
            while True:
                if self.is_stopped:
                    await self._publish("done", {"reason": "stopped_by_user"})
                    break

                # Call OpenAI API
                response = await self.client.chat.completions.create(
                    model=settings.openai_model,
                    messages=messages,
                    tools=TOOLS_DEFINITIONS,
                    tool_choice="auto",
                    stream=True,
                    temperature=settings.openai_temperature,
                    max_tokens=settings.openai_max_tokens,
                )

                content_buffer = ""
                tool_calls_buffer = {}

                # Process streaming response
                async for chunk in response:
                    if self.is_stopped:
                        break

                    # Check if choices array is not empty
                    if not chunk.choices:
                        import logging
                        logging.getLogger(__name__).warning(f"Received empty choices array in chunk")
                        continue

                    delta = chunk.choices[0].delta

                    # Handle text content
                    if delta.content:
                        content_chunk = delta.content
                        content_buffer += content_chunk
                        await self._publish("message", {"content": content_chunk})

                    # Handle tool calls
                    if delta.tool_calls:
                        for tc in delta.tool_calls:
                            idx = tc.index

                            if idx not in tool_calls_buffer:
                                tool_calls_buffer[idx] = {
                                    "id": "",
                                    "name": "",
                                    "arguments": ""
                                }

                                # Notify tool call start
                                if tc.function and tc.function.name:
                                    await self._publish("tool_call_start", {
                                        "tool_index": idx,
                                        "tool_name": tc.function.name,
                                    })

                                    # Save tool call to database
                                    await self.save_tool_call(
                                        tool_call_id=tc.id,
                                        tool_name=tc.function.name,
                                        params={},
                                        status=ToolCallStatus.PENDING
                                    )

                            if tc.id:
                                tool_calls_buffer[idx]["id"] = tc.id

                            if tc.function:
                                if tc.function.name:
                                    tool_calls_buffer[idx]["name"] = tc.function.name

                                if tc.function.arguments:
                                    tool_calls_buffer[idx]["arguments"] += tc.function.arguments

                # Check finish reason
                if chunk.choices:
                    finish_reason = chunk.choices[0].finish_reason
                else:
                    finish_reason = "stop"

                import logging
                logger = logging.getLogger(__name__)
                logger.info(f"Finish reason: {finish_reason}, Content length: {len(content_buffer)}, Tool calls buffer: {tool_calls_buffer}")

                # Execute tools if needed (check if tool_calls_buffer has entries with valid data)
                if tool_calls_buffer:
                    # Filter out incomplete tool calls
                    valid_tool_calls = {
                        idx: tc for idx, tc in tool_calls_buffer.items()
                        if tc.get("name") and tc.get("id") and tc.get("arguments")
                    }

                    if valid_tool_calls:
                        logger.info(f"Executing {len(valid_tool_calls)} tool calls")
                        for idx, tc in valid_tool_calls.items():
                            if self.is_stopped:
                                break

                            tool_name = tc["name"]
                            args = json.loads(tc["arguments"]) if tc.get("arguments") else {}

                            # Publish tool call progress
                            await self._publish("tool_call_progress", {
                                "tool_index": idx,
                                "tool_name": tool_name,
                                "status": "running",
                                "params": args,
                            })

                            # Update tool call status to running
                            await self.save_tool_call(
                                tool_call_id=tc["id"],
                                tool_name=tool_name,
                                params=args,
                                status=ToolCallStatus.RUNNING
                            )

                            # Execute tool
                            start_time = time.time()
                            try:
                                print(f"[DEBUG] AgentRunner executing tool: {tool_name} with args: {args}")
                                result = await execute_tool(tool_name, chat_id=self.chat_id, **args)
                                print(f"[DEBUG] AgentRunner tool {tool_name} returned: {result}")
                                execution_time = time.time() - start_time

                                # Update tool call status to success
                                await self.save_tool_call(
                                    tool_call_id=tc["id"],
                                    tool_name=tool_name,
                                    result=result,
                                    execution_time=execution_time,
                                    status=ToolCallStatus.SUCCESS
                                )

                                # Publish success
                                await self._publish("tool_call_complete", {
                                    "tool_index": idx,
                                    "tool_name": tool_name,
                                    "status": "success",
                                    "result": result,
                                    "execution_time": execution_time,
                                })

                                # Add to messages
                                messages.append({
                                    "role": "assistant",
                                    "tool_calls": [{
                                        "id": tc["id"],
                                        "type": "function",
                                        "function": {
                                            "name": tool_name,
                                            "arguments": tc["arguments"]
                                        }
                                    }]
                                })
                                messages.append({
                                    "role": "tool",
                                    "tool_call_id": tc["id"],
                                    "content": json.dumps(result),
                                })

                            except Exception as e:
                                execution_time = time.time() - start_time
                                error_msg = str(e)

                                # Update tool call status to failed
                                await self.save_tool_call(
                                    tool_call_id=tc["id"],
                                    tool_name=tool_name,
                                    error_message=error_msg,
                                    execution_time=execution_time,
                                    status=ToolCallStatus.FAILED
                                )

                                # Publish error
                                await self._publish("tool_call_complete", {
                                    "tool_index": idx,
                                    "tool_name": tool_name,
                                    "status": "failed",
                                    "error": error_msg,
                                    "execution_time": execution_time,
                                })

                                # Add error to messages
                                messages.append({
                                    "role": "assistant",
                                    "tool_calls": [{
                                        "id": tc["id"],
                                        "type": "function",
                                        "function": {
                                            "name": tool_name,
                                            "arguments": tc["arguments"]
                                        }
                                    }]
                                })
                                messages.append({
                                    "role": "tool",
                                    "tool_call_id": tc["id"],
                                    "content": json.dumps({"error": error_msg}),
                                })

                    # Continue conversation
                    continue

                # Save assistant message
                assistant_message = None
                if content_buffer:
                    assistant_message = await self.save_message(MessageRole.ASSISTANT, content_buffer)

                    # Update tool calls with message_id if they exist
                    if valid_tool_calls:
                        for idx, tc in valid_tool_calls.items():
                            await self.save_tool_call(
                                tool_call_id=tc["id"],
                                tool_name=tc["name"],
                                message_id=str(assistant_message.id)
                            )

                # Conversation complete
                await self._publish("done", {
                    "final_content": content_buffer,
                    "reason": "complete",
                })
                break

            # Cancel stop listener
            stop_task.cancel()
            try:
                await stop_task
            except asyncio.CancelledError:
                pass

        except Exception as e:
            await self._publish("error", {"message": str(e)})
