"""
Tool Call Model
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, ForeignKey, String, Float, Text, Enum as SQLEnum, DateTime, func
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
import enum

from app.database import Base


class ToolCallStatus(str, enum.Enum):
    """Tool call status enumeration"""
    PENDING = "pending"
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"


class ToolCall(Base):
    """Tool call model for tracking Agent tool invocations"""

    __tablename__ = "tool_calls"
    __allow_unmapped__ = True

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    # Fields
    chat_id = Column(
        UUID(as_uuid=True),
        ForeignKey("chats.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    message_id = Column(
        UUID(as_uuid=True),
        ForeignKey("messages.id", ondelete="CASCADE"),
        nullable=True,
    )
    tool_name = Column(String(100), nullable=False)
    tool_params = Column(JSONB, nullable=True)
    tool_result = Column(JSONB, nullable=True)
    status = Column(
        SQLEnum(ToolCallStatus),
        default=ToolCallStatus.PENDING,
        nullable=False,
    )
    execution_time = Column(Float, nullable=True)  # in seconds
    error_message = Column(Text, nullable=True)
    # Optional: OpenAI tool_call_id
    tool_call_id = Column(String(255), nullable=True, index=True)

    # Relationships
    chat = relationship("Chat", back_populates="tool_calls")
    message = relationship("Message", back_populates="tool_calls")

    def __repr__(self) -> str:
        return f"<ToolCall(id={self.id}, tool_name={self.tool_name}, status={self.status})>"
