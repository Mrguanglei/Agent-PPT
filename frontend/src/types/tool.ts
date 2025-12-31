export type ToolCallStatus = 'pending' | 'running' | 'success' | 'failed';

export interface ToolCall {
  id: string;
  index: number;
  name: string;
  status: ToolCallStatus;
  params?: Record<string, any>;
  result?: any;
  error?: string;
  executionTime?: number;
}

export interface SSEEvent {
  type: string;
  payload: any;
}

export interface MessageChunkEvent {
  type: 'message';
  payload: {
    content: string;
  };
}

export interface ToolCallStartEvent {
  type: 'tool_call_start';
  payload: {
    tool_index: number;
    tool_name: string;
  };
}

export interface ToolCallProgressEvent {
  type: 'tool_call_progress';
  payload: {
    tool_index: number;
    tool_name: string;
    status: ToolCallStatus;
    params?: Record<string, any>;
  };
}

export interface ToolCallCompleteEvent {
  type: 'tool_call_complete';
  payload: {
    tool_index: number;
    tool_name: string;
    status: ToolCallStatus;
    result?: any;
    error?: string;
    execution_time?: number;
  };
}

export interface SlideUpdateEvent {
  type: 'slide_update';
  payload: {
    action: 'initialize' | 'create' | 'update';
    slide_index?: number;
    title?: string;
    content?: string[];
  };
}

export interface DoneEvent {
  type: 'done';
  payload: {
    reason?: string;
  };
}

export interface ErrorEvent {
  type: 'error';
  payload: {
    message: string;
  };
}
