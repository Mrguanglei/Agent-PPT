"""
Chat Model
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, ForeignKey, Enum as SQLEnum, Text, DateTime, func
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import enum

from app.database import Base


class ChatStatus(str, enum.Enum):
    """Chat status enumeration"""
    ACTIVE = "active"
    GENERATING = "generating"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class Chat(Base):
    """Chat/Conversation model"""

    __tablename__ = "chats"
    __allow_unmapped__ = True

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    # Fields
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title = Column(String(255), nullable=True)
    status = Column(
        SQLEnum(ChatStatus),
        default=ChatStatus.ACTIVE,
        nullable=False,
    )
    # Optional: store model used for this chat
    model_name = Column(String(100), nullable=True)
    # Optional: store additional metadata
    extra_metadata = Column(Text, nullable=True)  # JSON string

    # Relationships
    user = relationship("User", back_populates="chats")
    messages = relationship(
        "Message",
        back_populates="chat",
        cascade="all, delete-orphan",
        order_by="Message.created_at",
    )
    tool_calls = relationship(
        "ToolCall",
        back_populates="chat",
        cascade="all, delete-orphan",
        order_by="ToolCall.created_at",
    )
    slides = relationship(
        "Slide",
        back_populates="chat",
        cascade="all, delete-orphan",
        order_by="Slide.index",
    )

    def __repr__(self) -> str:
        return f"<Chat(id={self.id}, title={self.title}, status={self.status})>"
