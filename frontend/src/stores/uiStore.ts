import { create } from 'zustand';

interface UIState {
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
  isMobile: boolean;

  setTheme: (theme: 'light' | 'dark') => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setIsMobile: (isMobile: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'dark',
  sidebarCollapsed: false,
  isMobile: false,

  setTheme: (theme) => set({ theme }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setIsMobile: (isMobile) => set({ isMobile }),
}));
