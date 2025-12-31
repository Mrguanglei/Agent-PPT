"""
Agent Schemas
"""
from typing import Optional, Any, Dict
from pydantic import BaseModel, Field
from app.models.tool_call import ToolCallStatus


class AgentRunRequest(BaseModel):
    """Agent run request schema"""
    chat_id: Optional[str] = None  # None for new chat
    message: str = Field(..., min_length=1, max_length=10000)
    model: Optional[str] = None


class AgentRunResponse(BaseModel):
    """Agent run response schema"""
    agent_run_id: str
    chat_id: str
    status: str


class ToolCallEvent(BaseModel):
    """Tool call event schema"""
    tool_index: int
    tool_name: str
    status: ToolCallStatus
    params: Optional[Dict[str, Any]] = None
    result: Optional[Any] = None
    error: Optional[str] = None
    execution_time: Optional[float] = None


class SSEEvent(BaseModel):
    """SSE event base schema"""
    type: str
    payload: Dict[str, Any]


class MessageChunkEvent(BaseModel):
    """Message chunk event (streaming text)"""
    type: str = "message"
    payload: Dict[str, str] = Field(default={"content": ""})


class ToolCallStartEvent(BaseModel):
    """Tool call start event"""
    type: str = "tool_call_start"
    payload: Dict[str, Any]


class ToolCallProgressEvent(BaseModel):
    """Tool call progress event"""
    type: str = "tool_call_progress"
    payload: ToolCallEvent


class ToolCallCompleteEvent(BaseModel):
    """Tool call complete event"""
    type: str = "tool_call_complete"
    payload: ToolCallEvent


class SlideUpdateEvent(BaseModel):
    """Slide update event"""
    type: str = "slide_update"
    payload: Dict[str, Any]


class DoneEvent(BaseModel):
    """Done event"""
    type: str = "done"
    payload: Dict[str, Any]


class ErrorEvent(BaseModel):
    """Error event"""
    type: str = "error"
    payload: Dict[str, str] = Field(default={"message": ""})
