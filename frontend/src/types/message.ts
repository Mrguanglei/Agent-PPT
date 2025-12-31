// Type definitions for Messages
export type MessageRole = 'user' | 'assistant' | 'system';

export interface ToolCallInMessage {
  index: number;
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  params?: Record<string, any>;
  result?: any;
  error?: string;
}

export interface Message {
  id: string;
  chat_id: string;
  role: MessageRole;
  content: string;
  tool_calls?: ToolCallInMessage[];
  created_at: string;
  updated_at: string;
}

export interface MessageListResponse {
  messages: Message[];
  total: number;
  chat_id: string;
}
