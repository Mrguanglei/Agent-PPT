// API Types
export interface User {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: 'draft' | 'generating' | 'completed' | 'failed';
  config: Record<string, any>;
  meta_data: Record<string, any>;
  created_at: string;
  updated_at: string;
  user?: User;
  slides_count?: number;
}

export interface Slide {
  id: string;
  project_id: string;
  index: number;
  html_content: string;
  thumbnail_url?: string;
  style_config: Record<string, any>;
  created_at: string;
  updated_at: string;
  assets?: SlideAsset[];
}

export interface SlideAsset {
  id: string;
  slide_id: string;
  asset_type: 'image' | 'chart' | 'icon' | 'video';
  asset_url: string;
  source_query?: string;
  meta_data: Record<string, any>;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  project_id?: string;
  messages: AgentMessage[];
  agent_state: Record<string, any>;
  created_at: string;
}

export interface AgentMessage {
  role: 'user' | 'assistant' | 'tool';
  content: string;
  tool_calls?: any[];
  tool_call_id?: string;
}

export interface AgentLog {
  id: string;
  conversation_id: string;
  tool_name?: string;
  tool_params?: Record<string, any>;
  tool_result?: Record<string, any>;
  execution_time?: number;
  status: string;
  error_message?: string;
  created_at: string;
}

// API Request/Response Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface CreateProjectRequest {
  title: string;
  description?: string;
  config?: Record<string, any>;
}

export interface UpdateProjectRequest {
  title?: string;
  description?: string;
  status?: string;
  config?: Record<string, any>;
  meta_data?: Record<string, any>;
}

export interface CreateSlideRequest {
  index: number;
  html_content: string;
  style_config?: Record<string, any>;
}

export interface UpdateSlideRequest {
  html_content?: string;
  style_config?: Record<string, any>;
}

export interface CreateAssetRequest {
  asset_type: 'image' | 'chart' | 'icon' | 'video';
  asset_url: string;
  source_query?: string;
  meta_data?: Record<string, any>;
}

export interface CreateConversationRequest {
  project_id?: string;
  messages?: AgentMessage[];
  agent_state?: Record<string, any>;
}

// EventSource Stream Types (formerly WebSocket)
export interface AgentStreamMessage {
  type: 'message' | 'tool_call_start' | 'tool_call_complete' | 'error';
  data: any;
}

export interface ToolCallData {
  tool: string;
  status?: string;
  result?: any;
}

// UI State Types
export interface Message {
  id: string;
  type: 'user' | 'assistant' | 'tool';
  content: string;
  timestamp: Date;
  toolCall?: ToolCallData;
  slides?: Slide[];
}

export interface ToolCallState {
  tool: string;
  status: 'starting' | 'processing' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

// Store Types
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: { email: string; username: string; password: string }) => Promise<void>;
}

export interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  fetchProjects: () => Promise<void>;
  createProject: (data: CreateProjectRequest) => Promise<Project>;
  updateProject: (id: string, data: UpdateProjectRequest) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setCurrentProject: (project: Project | null) => void;
}

export interface AgentState {
  messages: Message[];
  currentConversationId: string | null;
  isProcessing: boolean;
  currentToolCall: ToolCallState | null;
  sendMessage: (message: string, projectId?: string) => Promise<void>;
  createConversation: (projectId?: string) => Promise<string>;
  clearMessages: () => void;
}

export interface SlideState {
  slides: Slide[];
  loading: boolean;
  fetchSlides: (projectId: string) => Promise<void>;
  createSlide: (projectId: string, data: CreateSlideRequest) => Promise<Slide>;
  updateSlide: (slideId: string, projectId: string, data: UpdateSlideRequest) => Promise<void>;
  deleteSlide: (slideId: string, projectId: string) => Promise<void>;
  reorderSlides: (projectId: string, slideOrders: { id: string; index: number }[]) => Promise<void>;
}
