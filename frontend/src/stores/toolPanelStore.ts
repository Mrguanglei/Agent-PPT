import { create } from 'zustand';
import type { ToolCall, ToolCallStatus } from '@/types/tool';

interface ToolPanelState {
  isOpen: boolean;
  selectedIndex: number | null;
  toolCalls: ToolCall[];

  openPanel: (index?: number) => void;
  closePanel: () => void;
  selectTool: (index: number) => void;
  addToolCall: (tool: Omit<ToolCall, 'id'>) => void;
  updateToolCall: (index: number, data: Partial<ToolCall>) => void;
  clearToolCalls: () => void;
}

export const useToolPanelStore = create<ToolPanelState>((set) => ({
  isOpen: false,
  selectedIndex: null,
  toolCalls: [],

  openPanel: (index) => set({ isOpen: true, selectedIndex: index ?? null }),
  closePanel: () => set({ isOpen: false, selectedIndex: null }),
  selectTool: (index) => set({ selectedIndex: index }), // 只设置选中索引，不自动打开面板

  addToolCall: (tool) => set((state) => ({
    toolCalls: [...state.toolCalls, { ...tool, id: `tool-${Date.now()}-${Math.random()}` }]
  })),

  updateToolCall: (index, data) => set((state) => ({
    toolCalls: state.toolCalls.map(tc =>
      tc.index === index ? { ...tc, ...data } : tc
    )
  })),

  clearToolCalls: () => set({ toolCalls: [], selectedIndex: null }),
}));
