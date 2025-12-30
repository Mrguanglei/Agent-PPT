from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from uuid import UUID


class AgentMessage(BaseModel):
    role: str  # "user", "assistant", "tool"
    content: str
    tool_calls: Optional[List[Dict[str, Any]]] = None
    tool_call_id: Optional[str] = None


class ConversationBase(BaseModel):
    messages: List[AgentMessage] = []
    agent_state: Optional[Dict[str, Any]] = {}


class ConversationCreate(ConversationBase):
    project_id: Optional[UUID] = None


class ConversationInDB(ConversationBase):
    id: UUID
    user_id: UUID
    project_id: Optional[UUID] = None
    created_at: datetime

    class Config:
        from_attributes = True


class Conversation(ConversationInDB):
    pass


class AgentLogBase(BaseModel):
    tool_name: Optional[str] = None
    tool_params: Optional[Dict[str, Any]] = None
    tool_result: Optional[Dict[str, Any]] = None
    execution_time: Optional[float] = None
    status: str
    error_message: Optional[str] = None


class AgentLogInDB(AgentLogBase):
    id: UUID
    conversation_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class AgentLog(AgentLogInDB):
    pass


class AgentRequest(BaseModel):
    message: str = Field(min_length=1)
    conversation_id: Optional[UUID] = None


class AgentResponse(BaseModel):
    type: str  # "message", "tool_call_start", "tool_call_complete", "error"
    data: Dict[str, Any]


class ImageSearchResult(BaseModel):
    url: str
    thumbnail: Optional[str] = None
    title: Optional[str] = None
    source: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None


class WebSearchResult(BaseModel):
    title: str
    link: str
    snippet: str
    display_link: Optional[str] = None
