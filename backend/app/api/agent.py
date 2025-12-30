from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from uuid import UUID
import json
import logging
import asyncio
from app.database import get_db
from app.services.agent_service import AgentService
from app.services.project_service import ProjectService
from app.services.redis_service import redis_service
from app.agent.core import PPTAgent
from app.schemas.agent import Conversation, ConversationCreate, AgentRequest, AgentLog
from app.models.user import User
from app.dependencies import get_current_active_user
from app.tasks import process_agent_message


router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/conversations", response_model=Conversation)
async def create_conversation(
    conversation_data: ConversationCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """创建对话"""
    # 如果指定了项目ID，检查项目权限
    if conversation_data.project_id:
        project = await ProjectService.get_project(db, conversation_data.project_id, current_user.id)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )

    conversation = await AgentService.create_conversation(db, current_user.id, conversation_data)
    return Conversation.from_orm(conversation)


@router.get("/conversations", response_model=List[Conversation])
async def get_conversations(
    project_id: UUID = None,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """获取对话列表"""
    conversations = await AgentService.get_conversations_by_user(db, current_user.id, project_id)
    return [Conversation.from_orm(conv) for conv in conversations]


@router.get("/conversations/{conversation_id}", response_model=Conversation)
async def get_conversation(
    conversation_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """获取对话详情"""
    conversation = await AgentService.get_conversation(db, conversation_id, current_user.id)
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    return Conversation.from_orm(conversation)


@router.get("/conversations/{conversation_id}/logs", response_model=List[AgentLog])
async def get_agent_logs(
    conversation_id: UUID,
    limit: int = 50,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """获取Agent执行日志"""
    # 检查对话权限
    conversation = await AgentService.get_conversation(db, conversation_id, current_user.id)
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )

    logs = await AgentService.get_agent_logs(db, conversation_id, limit)
    return [AgentLog.from_orm(log) for log in logs]


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """删除对话"""
    success = await AgentService.delete_conversation(db, conversation_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found or access denied"
        )
    return {"message": "Conversation deleted successfully"}

# 已移除WebSocket路由，使用SSE + Redis PubSub架构


@router.post("/conversations/{conversation_id}/messages")
async def send_agent_message(
    conversation_id: UUID,
    message_data: dict,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """发送消息给Agent（异步处理）"""
    # 检查对话权限
    conversation = await AgentService.get_conversation(db, conversation_id, current_user.id)
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )

    user_message = message_data.get("message", "")
    project_id = message_data.get("project_id")

    if not user_message:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message cannot be empty"
        )

    # 异步处理消息
    task = process_agent_message.delay(
        str(conversation_id),
        user_message,
        str(current_user.id),
        str(project_id) if project_id else None
    )

    return {
        "task_id": task.id,
        "status": "processing",
        "conversation_id": str(conversation_id)
    }


@router.get("/conversations/{conversation_id}/stream")
async def stream_agent_messages(
    conversation_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """SSE流式接收Agent消息"""
    # 检查对话权限
    conversation = await AgentService.get_conversation(db, conversation_id, current_user.id)
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )

    async def event_generator():
        """生成SSE事件"""
        try:
            # 连接到Redis并监听消息
            await redis_service.connect()
            channel = f"conversation:{conversation_id}"

            logger.info(f"Starting SSE stream for conversation {conversation_id}")

            # 发送连接成功事件
            yield f"event: connected\ndata: {json.dumps({'status': 'connected'})}\n\n"

            async for message in redis_service.listen_messages(channel):
                # 发送SSE事件
                event_data = json.dumps(message)
                yield f"event: message\ndata: {event_data}\n\n"

        except Exception as e:
            logger.error(f"SSE stream error: {e}")
            error_data = json.dumps({
                "type": "error",
                "data": {"message": str(e)}
            })
            yield f"event: error\ndata: {error_data}\n\n"
        finally:
            await redis_service.disconnect()

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Cache-Control",
        }
    )
