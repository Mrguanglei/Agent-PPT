import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, User, LoginRequest } from '@/types';
import { authApi } from '@/services/api';
import toast from 'react-hot-toast';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        try {
          const response = await authApi.loginJson({ email, password });
          const { access_token } = response.data;

          // Store token
          localStorage.setItem('auth_token', access_token);
          set({ token: access_token });

          // Get user info
          const userResponse = await authApi.getMe();
          set({
            user: userResponse.data,
            isAuthenticated: true,
          });

          toast.success('登录成功');
        } catch (error: any) {
          const message = error.response?.data?.detail || '登录失败';
          toast.error(message);
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('auth_token');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        toast.success('已退出登录');
      },

      register: async (userData) => {
        try {
          const response = await authApi.register(userData);
          toast.success('注册成功，请登录');
        } catch (error: any) {
          const message = error.response?.data?.detail || '注册失败';
          toast.error(message);
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
