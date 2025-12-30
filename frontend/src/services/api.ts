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

// Create axios instance
const api = axios.create({
  baseURL: '/api',
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
      localStorage.removeItem('auth_token');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (data: LoginRequest) => api.post<LoginResponse>('/auth/login', data),
  loginJson: (data: LoginRequest) => api.post<LoginResponse>('/auth/login/json', data),
  register: (data: { email: string; username: string; password: string }) =>
    api.post<User>('/auth/register', data),
  getMe: () => api.get<User>('/auth/me'),
};

// Projects API
export const projectsApi = {
  getProjects: () => api.get<Project[]>('/projects/'),
  getProject: (id: string) => api.get<Project>(`/projects/${id}`),
  createProject: (data: CreateProjectRequest) => api.post<Project>('/projects/', data),
  updateProject: (id: string, data: UpdateProjectRequest) => api.put<Project>(`/projects/${id}`, data),
  deleteProject: (id: string) => api.delete(`/projects/${id}`),
};

// Slides API
export const slidesApi = {
  getSlides: (projectId: string) => api.get<Slide[]>(`/slides/?project_id=${projectId}`),
  getSlide: (slideId: string, projectId: string) =>
    api.get<Slide>(`/slides/${slideId}?project_id=${projectId}`),
  createSlide: (projectId: string, data: CreateSlideRequest) =>
    api.post<Slide>('/slides/', { ...data, project_id: projectId }),
  updateSlide: (slideId: string, projectId: string, data: UpdateSlideRequest) =>
    api.put<Slide>(`/slides/${slideId}?project_id=${projectId}`, data),
  deleteSlide: (slideId: string, projectId: string) =>
    api.delete(`/slides/${slideId}?project_id=${projectId}`),
  createAsset: (slideId: string, projectId: string, data: CreateAssetRequest) =>
    api.post<SlideAsset>(`/slides/${slideId}/assets?project_id=${projectId}`, data),
  getAssets: (slideId: string, projectId: string) =>
    api.get<SlideAsset[]>(`/slides/${slideId}/assets?project_id=${projectId}`),
  updateAsset: (slideId: string, assetId: string, projectId: string, data: Partial<CreateAssetRequest>) =>
    api.put<SlideAsset>(`/slides/${slideId}/assets/${assetId}?project_id=${projectId}`, data),
  deleteAsset: (slideId: string, assetId: string, projectId: string) =>
    api.delete(`/slides/${slideId}/assets/${assetId}?project_id=${projectId}`),
};

// Agent API
export const agentApi = {
  createConversation: (data: CreateConversationRequest) =>
    api.post<Conversation>('/agent/conversations', data),
  getConversations: (projectId?: string) =>
    api.get<Conversation[]>(`/agent/conversations${projectId ? `?project_id=${projectId}` : ''}`),
  getConversation: (id: string) => api.get<Conversation>(`/agent/conversations/${id}`),
  getAgentLogs: (conversationId: string, limit: number = 50) =>
    api.get<AgentLog[]>(`/agent/conversations/${conversationId}/logs?limit=${limit}`),
};

export default api;
