from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID
import json
import logging
from app.database import get_db
from app.services.agent_service import AgentService
from app.services.project_service import ProjectService
from app.agent.core import PPTAgent
from app.schemas.agent import Conversation, ConversationCreate, AgentRequest, AgentLog
from app.models.user import User
from app.dependencies import get_current_active_user


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


@router.websocket("/ws/{conversation_id}")
async def agent_websocket(
    websocket: WebSocket,
    conversation_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Agent WebSocket连接"""
    await websocket.accept()

    # 创建Agent实例
    agent = PPTAgent()

    try:
        while True:
            # 接收消息
            data = await websocket.receive_text()
            try:
                request_data = json.loads(data)
                user_message = request_data.get("message", "")
                project_id = request_data.get("project_id")

                if not user_message:
                    await websocket.send_json({
                        "type": "error",
                        "data": {"message": "Message cannot be empty"}
                    })
                    continue

                # 获取或创建对话历史
                conversation = await AgentService.get_conversation(db, conversation_id, None)  # 这里需要修改权限检查
                if conversation:
                    conversation_history = conversation.messages
                else:
                    conversation_history = []

                # 处理消息流
                async for response in agent.process_stream(
                    str(project_id) if project_id else None,
                    user_message,
                    conversation_history
                ):
                    await websocket.send_json(response)

                    # 更新对话历史
                    if response["type"] == "message":
                        conversation_history.append({
                            "role": "assistant",
                            "content": response["data"]["content"]
                        })
                    elif response["type"] == "tool_call_complete":
                        # 这里可以添加工具调用结果到历史
                        pass

                # 保存对话历史
                await AgentService.update_conversation_messages(
                    db,
                    conversation_id,
                    conversation_history
                )

            except json.JSONDecodeError:
                await websocket.send_json({
                    "type": "error",
                    "data": {"message": "Invalid JSON format"}
                })
            except Exception as e:
                logger.error(f"Agent processing error: {e}", exc_info=True)
                await websocket.send_json({
                    "type": "error",
                    "data": {"message": str(e)}
                })

    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for conversation {conversation_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}", exc_info=True)
    finally:
        # 清理资源
        pass
