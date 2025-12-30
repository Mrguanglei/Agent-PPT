from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from app.models.conversation import Conversation, AgentLog
from app.schemas.agent import ConversationCreate, AgentLogBase


class AgentService:
    """Agent服务"""

    @classmethod
    async def create_conversation(
        cls,
        db: AsyncSession,
        user_id: UUID,
        conversation_data: ConversationCreate
    ) -> Conversation:
        """创建对话"""
        conversation = Conversation(
            user_id=user_id,
            project_id=conversation_data.project_id,
            messages=conversation_data.messages,
            agent_state=conversation_data.agent_state
        )

        db.add(conversation)
        await db.commit()
        await db.refresh(conversation)
        return conversation

    @classmethod
    async def get_conversation(
        cls,
        db: AsyncSession,
        conversation_id: UUID,
        user_id: UUID
    ) -> Optional[Conversation]:
        """获取对话"""
        result = await db.execute(
            select(Conversation).where(
                Conversation.id == conversation_id,
                Conversation.user_id == user_id
            )
        )
        return result.scalar_one_or_none()

    @classmethod
    async def get_conversations_by_user(
        cls,
        db: AsyncSession,
        user_id: UUID,
        project_id: Optional[UUID] = None
    ) -> List[Conversation]:
        """获取用户的对话列表"""
        query = select(Conversation).where(Conversation.user_id == user_id)
        if project_id:
            query = query.where(Conversation.project_id == project_id)

        result = await db.execute(query.order_by(Conversation.created_at.desc()))
        return list(result.scalars().all())

    @classmethod
    async def update_conversation_messages(
        cls,
        db: AsyncSession,
        conversation_id: UUID,
        messages: List[dict],
        agent_state: Optional[dict] = None
    ) -> bool:
        """更新对话消息"""
        from sqlalchemy import update

        update_data = {"messages": messages}
        if agent_state is not None:
            update_data["agent_state"] = agent_state

        result = await db.execute(
            update(Conversation)
            .where(Conversation.id == conversation_id)
            .values(**update_data)
        )
        await db.commit()
        return result.rowcount > 0

    @classmethod
    async def create_agent_log(
        cls,
        db: AsyncSession,
        conversation_id: UUID,
        log_data: AgentLogBase
    ) -> AgentLog:
        """创建Agent日志"""
        log = AgentLog(
            conversation_id=conversation_id,
            tool_name=log_data.tool_name,
            tool_params=log_data.tool_params,
            tool_result=log_data.tool_result,
            execution_time=log_data.execution_time,
            status=log_data.status,
            error_message=log_data.error_message
        )

        db.add(log)
        await db.commit()
        await db.refresh(log)
        return log

    @classmethod
    async def get_agent_logs(
        cls,
        db: AsyncSession,
        conversation_id: UUID,
        limit: int = 50
    ) -> List[AgentLog]:
        """获取Agent日志"""
        result = await db.execute(
            select(AgentLog)
            .where(AgentLog.conversation_id == conversation_id)
            .order_by(AgentLog.created_at.desc())
            .limit(limit)
        )
        return list(result.scalars().all())
