export interface Slide {
  id: string;
  chat_id: string;
  index: number;
  title: string | null;
  html_content: string;
  thumbnail_url: string | null;
  style_config: Record<string, any> | null;
  raw_content: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface SlideListResponse {
  slides: Slide[];
  total: number;
  chat_id: string;
}
