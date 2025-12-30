import axios from 'axios';
import type {
  User,
  Project,
  Slide,
  SlideAsset,
  Conversation,
  AgentLog,
  LoginRequest,
  LoginResponse,
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateSlideRequest,
  UpdateSlideRequest,
  CreateAssetRequest,
  CreateConversationRequest,
} from '@/types';

// Create axios instance - use vite proxy
const api = axios.create({
  baseURL: '',
  timeout: 10000,
});

// Add request interceptor for debugging
api.interceptors.request.use((config) => {
  console.log('API Request:', config.method?.toUpperCase(), config.url);
  return config;
});

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', error.config?.url, error.message);
    return Promise.reject(error);
  }
);

// Use backend URL for direct API calls (for auth and other direct calls)
export const directApi = axios.create({
  baseURL: 'http://localhost:18000',
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear authentication state and reload to reset store
      localStorage.removeItem('auth_token');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

// Auth API - 使用直接连接
export const authApi = {
  login: (data: LoginRequest) => directApi.post<LoginResponse>('/api/auth/login', data),
  loginJson: (data: LoginRequest) => directApi.post<LoginResponse>('/api/auth/login/json', data),
  register: (data: { email: string; username: string; password: string }) =>
    directApi.post<User>('/api/auth/register', data),
  getMe: () => directApi.get<User>('/api/auth/me'),
};

// Projects API
export const projectsApi = {
  getProjects: () => api.get<Project[]>('/api/projects/'),
  getProject: (id: string) => api.get<Project>(`/api/projects/${id}`),
  createProject: (data: CreateProjectRequest) => api.post<Project>('/api/projects/', data),
  updateProject: (id: string, data: UpdateProjectRequest) => api.put<Project>(`/api/projects/${id}`, data),
  deleteProject: (id: string) => api.delete(`/api/projects/${id}`),
};

// Slides API
export const slidesApi = {
  getSlides: (projectId: string) => api.get<Slide[]>(`/api/slides/?project_id=${projectId}`),
  getSlide: (slideId: string, projectId: string) =>
    api.get<Slide>(`/api/slides/${slideId}?project_id=${projectId}`),
  createSlide: (projectId: string, data: CreateSlideRequest) =>
    api.post<Slide>('/api/slides/', { ...data, project_id: projectId }),
  updateSlide: (slideId: string, projectId: string, data: UpdateSlideRequest) =>
    api.put<Slide>(`/api/slides/${slideId}?project_id=${projectId}`, data),
  deleteSlide: (slideId: string, projectId: string) =>
    api.delete(`/api/slides/${slideId}?project_id=${projectId}`),
  createAsset: (slideId: string, projectId: string, data: CreateAssetRequest) =>
    api.post<SlideAsset>(`/api/slides/${slideId}/assets?project_id=${projectId}`, data),
  getAssets: (slideId: string, projectId: string) =>
    api.get<SlideAsset[]>(`/api/slides/${slideId}/assets?project_id=${projectId}`),
  updateAsset: (slideId: string, assetId: string, projectId: string, data: Partial<CreateAssetRequest>) =>
    api.put<SlideAsset>(`/api/slides/${slideId}/assets/${assetId}?project_id=${projectId}`, data),
  deleteAsset: (slideId: string, assetId: string, projectId: string) =>
    api.delete(`/api/slides/${slideId}/assets/${assetId}?project_id=${projectId}`),
};

// Agent API
export const agentApi = {
  createConversation: (data: CreateConversationRequest) =>
    api.post<Conversation>('/api/agent/conversations', data),
  getConversations: (projectId?: string) =>
    api.get<Conversation[]>(`/api/agent/conversations${projectId ? `?project_id=${projectId}` : ''}`),
  getConversation: (id: string) => api.get<Conversation>(`/api/agent/conversations/${id}`),
  deleteConversation: (conversationId: string) =>
    api.delete(`/api/agent/conversations/${conversationId}`),
  getAgentLogs: (conversationId: string, limit: number = 50) =>
    api.get<AgentLog[]>(`/api/agent/conversations/${conversationId}/logs?limit=${limit}`),
  sendMessage: (conversationId: string, data: { message: string; project_id?: string }) =>
    api.post(`/api/agent/conversations/${conversationId}/messages`, data),
};

export default api;
