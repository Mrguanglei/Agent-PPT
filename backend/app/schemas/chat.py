"""
Chat Schemas
"""
from datetime import datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field
from app.models.chat import ChatStatus


class ChatBase(BaseModel):
    """Base chat schema"""
    title: Optional[str] = Field(None, max_length=255)


class ChatCreate(ChatBase):
    """Chat creation schema"""
    pass


class ChatUpdate(BaseModel):
    """Chat update schema"""
    title: str = Field(..., min_length=1, max_length=255)
    status: Optional[ChatStatus] = None


class ChatResponse(ChatBase):
    """Chat response schema"""
    id: UUID
    user_id: UUID
    status: ChatStatus
    model_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    message_count: int = 0
    slide_count: int = 0

    class Config:
        from_attributes = True


class ChatListResponse(BaseModel):
    """Chat list response schema"""
    chats: List[ChatResponse]
    total: int
    page: int = 1
    page_size: int = 20
