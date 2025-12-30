import { create } from 'zustand';
import type { SlideState, Slide, CreateSlideRequest, UpdateSlideRequest } from '@/types';
import { slidesApi } from '@/services/api';
import toast from 'react-hot-toast';

export const useSlideStore = create<SlideState>((set, get) => ({
  slides: [],
  loading: false,

  fetchSlides: async (projectId: string) => {
    set({ loading: true });
    try {
      const response = await slidesApi.getSlides(projectId);
      set({ slides: response.data, loading: false });
    } catch (error: any) {
      console.error('Failed to fetch slides:', error);
      toast.error('获取幻灯片失败');
      set({ loading: false });
    }
  },

  createSlide: async (projectId: string, data: CreateSlideRequest) => {
    try {
      const response = await slidesApi.createSlide(projectId, data);
      const newSlide = response.data;

      set(state => ({
        slides: [...state.slides, newSlide].sort((a, b) => a.index - b.index),
      }));

      toast.success('幻灯片创建成功');
      return newSlide;
    } catch (error: any) {
      const message = error.response?.data?.detail || '创建幻灯片失败';
      toast.error(message);
      throw error;
    }
  },

  updateSlide: async (slideId: string, projectId: string, data: UpdateSlideRequest) => {
    try {
      await slidesApi.updateSlide(slideId, projectId, data);

      set(state => ({
        slides: state.slides.map(slide =>
          slide.id === slideId ? { ...slide, ...data } : slide
        ),
      }));

      toast.success('幻灯片更新成功');
    } catch (error: any) {
      const message = error.response?.data?.detail || '更新幻灯片失败';
      toast.error(message);
      throw error;
    }
  },

  deleteSlide: async (slideId: string, projectId: string) => {
    try {
      await slidesApi.deleteSlide(slideId, projectId);

      set(state => ({
        slides: state.slides.filter(slide => slide.id !== slideId),
      }));

      toast.success('幻灯片删除成功');
    } catch (error: any) {
      const message = error.response?.data?.detail || '删除幻灯片失败';
      toast.error(message);
      throw error;
    }
  },

  reorderSlides: async (projectId: string, slideOrders: { id: string; index: number }[]) => {
    try {
      // Update local state first for immediate UI feedback
      set(state => ({
        slides: state.slides.map(slide => {
          const order = slideOrders.find(o => o.id === slide.id);
          return order ? { ...slide, index: order.index } : slide;
        }).sort((a, b) => a.index - b.index),
      }));

      // Here you would typically call an API endpoint to persist the order
      // For now, we'll just simulate success
      toast.success('幻灯片重新排序成功');
    } catch (error: any) {
      toast.error('重新排序失败');
      throw error;
    }
  },
}));
