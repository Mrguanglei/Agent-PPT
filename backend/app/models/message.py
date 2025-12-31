"""
Message Model
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, ForeignKey, Text, Enum as SQLEnum, DateTime, func
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import enum

from app.database import Base


class MessageRole(str, enum.Enum):
    """Message role enumeration"""
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class Message(Base):
    """Message model for storing chat messages"""

    __tablename__ = "messages"
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
    role = Column(
        SQLEnum(MessageRole),
        nullable=False,
    )
    content = Column(Text, nullable=False)
    # Optional: store token counts
    prompt_tokens = Column(Text, nullable=True)  # Store as string to avoid int overflow
    completion_tokens = Column(Text, nullable=True)

    # Relationships
    chat = relationship("Chat", back_populates="messages")
    tool_calls = relationship(
        "ToolCall",
        back_populates="message",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        content_preview = self.content[:50] + "..." if len(self.content) > 50 else self.content
        return f"<Message(id={self.id}, role={self.role}, content={content_preview})>"
