export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const SSE_TIMEOUT = 300000; // 5 minutes

export const MAX_MESSAGE_LENGTH = 10000;

export const TOOL_LABELS: Record<string, string> = {
  think: '思考规划',
  web_search: '网页搜索',
  search_images: '图片搜索',
  visit_page: '访问网页',
  initialize_slide: '初始化幻灯片',
  insert_slides: '插入幻灯片',
  html: '生成HTML内容',
  update_slide: '更新幻灯片',
};

export const LAYOUT_OPTIONS = [
  { value: 'title', label: 'Title Slide' },
  { value: 'content', label: 'Content' },
  { value: 'two_column', label: 'Two Columns' },
  { value: 'image_left', label: 'Image Left' },
  { value: 'image_right', label: 'Image Right' },
  { value: 'full_image', label: 'Full Image' },
];

export const THEME_OPTIONS = [
  { value: 'modern', label: 'Modern' },
  { value: 'classic', label: 'Classic' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'creative', label: 'Creative' },
];
