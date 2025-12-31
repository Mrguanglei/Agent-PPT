"""
Message Schemas
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from app.models.message import MessageRole


class MessageBase(BaseModel):
    """Base message schema"""
    role: MessageRole
    content: str


class MessageCreate(MessageBase):
    """Message creation schema"""
    chat_id: str


class MessageResponse(MessageBase):
    """Message response schema"""
    id: str
    chat_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MessageListResponse(BaseModel):
    """Message list response schema"""
    messages: List[MessageResponse]
    total: int
    chat_id: str
