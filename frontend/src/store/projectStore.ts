import { create } from 'zustand';
import type { ProjectState, Project, CreateProjectRequest, UpdateProjectRequest } from '@/types';
import { projectsApi } from '@/services/api';
import toast from 'react-hot-toast';

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  loading: false,

  fetchProjects: async () => {
    set({ loading: true });
    try {
      const response = await projectsApi.getProjects();
      set({ projects: response.data, loading: false });
    } catch (error: any) {
      console.error('Failed to fetch projects:', error);
      toast.error('获取项目列表失败');
      set({ loading: false });
    }
  },

  createProject: async (data: CreateProjectRequest) => {
    try {
      const response = await projectsApi.createProject(data);
      const newProject = response.data;

      set(state => ({
        projects: [newProject, ...state.projects],
        currentProject: newProject,
      }));

      toast.success('项目创建成功');
      return newProject;
    } catch (error: any) {
      const message = error.response?.data?.detail || '创建项目失败';
      toast.error(message);
      throw error;
    }
  },

  updateProject: async (id: string, data: UpdateProjectRequest) => {
    try {
      await projectsApi.updateProject(id, data);

      set(state => ({
        projects: state.projects.map(project =>
          project.id === id ? { ...project, ...data } : project
        ),
        currentProject: state.currentProject?.id === id
          ? { ...state.currentProject, ...data }
          : state.currentProject,
      }));

      toast.success('项目更新成功');
    } catch (error: any) {
      const message = error.response?.data?.detail || '更新项目失败';
      toast.error(message);
      throw error;
    }
  },

  deleteProject: async (id: string) => {
    try {
      await projectsApi.deleteProject(id);

      set(state => ({
        projects: state.projects.filter(project => project.id !== id),
        currentProject: state.currentProject?.id === id ? null : state.currentProject,
      }));

      toast.success('项目删除成功');
    } catch (error: any) {
      const message = error.response?.data?.detail || '删除项目失败';
      toast.error(message);
      throw error;
    }
  },

  setCurrentProject: (project: Project | null) => {
    set({ currentProject: project });
  },
}));
