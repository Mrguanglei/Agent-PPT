// Type definitions for Messages
export type MessageRole = 'user' | 'assistant' | 'system';

export type InteractionType = 'requirement_confirm' | 'plan_confirm' | 'execution_log';

export interface InteractionCard {
  type: InteractionType;
  title: string;
  status: 'pending' | 'confirmed' | 'auto_confirming';
  data: any;
  countdown?: number;
}

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
  interaction_card?: InteractionCard; // 新增：交互卡片支持
  created_at: string;
  updated_at: string;
}

export interface MessageListResponse {
  messages: Message[];
  total: number;
  chat_id: string;
}
