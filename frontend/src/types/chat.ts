export interface Chat {
  id: string;
  user_id: string;
  title: string | null;
  status: 'active' | 'generating' | 'completed' | 'archived';
  model_name: string | null;
  created_at: string;
  updated_at: string;
  message_count: number;
  slide_count: number;
}

export interface ChatListResponse {
  chats: Chat[];
  total: number;
  page: number;
  page_size: number;
}
