from sqlalchemy import Column, ForeignKey, Text, Float, String, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.models.base import Base


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"))
    messages = Column(JSONB, nullable=False, default=[])
    agent_state = Column(JSONB, default={})
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 关系
    user = relationship("User", back_populates="conversations")
    project = relationship("Project", back_populates="conversations")
    agent_logs = relationship("AgentLog", back_populates="conversation", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Conversation {self.id}>"


class AgentLog(Base):
    __tablename__ = "agent_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id", ondelete="CASCADE"))
    tool_name = Column(String(100))
    tool_params = Column(JSONB)
    tool_result = Column(JSONB)
    execution_time = Column(Float)
    status = Column(String(50))  # success, failed
    error_message = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 关系
    conversation = relationship("Conversation", back_populates="agent_logs")

    def __repr__(self):
        return f"<AgentLog {self.tool_name} - {self.status}>"
