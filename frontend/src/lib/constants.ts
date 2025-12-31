export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const SSE_TIMEOUT = 300000; // 5 minutes

export const MAX_MESSAGE_LENGTH = 10000;

export const TOOL_LABELS: Record<string, string> = {
  search_images: 'Image Search',
  web_search: 'Web Search',
  visit_page: 'Visit Page',
  insert_page: 'Insert Page',
  update_page: 'Update Page',
  initialize_design: 'Initialize Design',
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
