import { create } from 'zustand';
import { agentApi } from '@/services/api';
import { useAgentStore } from '@/store/agentStore';
import toast from 'react-hot-toast';

interface Conversation {
  id: string;
  user_id: string;
  project_id?: string;
  messages: any[];
  agent_state: any;
  created_at: string;
  updated_at?: string;
  title?: string;
  lastMessage?: string;
}

interface ConversationStore {
  conversations: Conversation[];
  currentId: string | null;
  loading: boolean;

  fetchConversations: () => Promise<void>;
  createConversation: (projectId?: string) => Promise<string | null>;
  switchConversation: (id: string) => void;
  deleteConversation: (id: string) => Promise<void>;
  updateConversation: (id: string, data: Partial<Conversation>) => void;
  setCurrentConversation: (id: string | null) => void;
}

export const useConversationStore = create<ConversationStore>((set, get) => ({
  conversations: [],
  currentId: null,
  loading: false,

  fetchConversations: async () => {
    try {
      set({ loading: true });
      const response = await agentApi.getConversations();
      const conversations = response.data.map((conv: Conversation) => ({
        ...conv,
        title: conv.messages.length > 0 ? conv.messages[0]?.content?.slice(0, 50) + '...' : '新对话',
        lastMessage: conv.messages.length > 0 ? conv.messages[conv.messages.length - 1]?.content?.slice(0, 50) + '...' : '',
        updatedAt: conv.created_at
      }));
      set({ conversations });
    } catch (error: any) {
      console.error('Failed to fetch conversations:', error);
      toast.error('获取对话列表失败');
    } finally {
      set({ loading: false });
    }
  },

  createConversation: async (projectId?: string) => {
    try {
      const response = await agentApi.createConversation({
        project_id: projectId,
        messages: [],
        agent_state: {},
      });

      const newConversation: Conversation = {
        ...response.data,
        title: '新对话',
        lastMessage: '',
        updatedAt: response.data.created_at
      };

      set((state) => ({
        conversations: [newConversation, ...state.conversations],
        currentId: newConversation.id
      }));

      return newConversation.id;
    } catch (error: any) {
      console.error('Failed to create conversation:', error);
      toast.error('创建对话失败');
      return null;
    }
  },

  switchConversation: (id: string) => {
    set({ currentId: id });
  },

  deleteConversation: async (id: string) => {
    try {
      // 调用后端API删除对话
      await agentApi.deleteConversation(id);

      // 如果删除的是当前对话，清理agentStore状态
      if (get().currentId === id) {
        useAgentStore.getState().clearMessages();
      }

      // 从本地状态中移除
      set((state) => {
        const filtered = state.conversations.filter((c) => c.id !== id);
        return {
          conversations: filtered,
          currentId: state.currentId === id ? (filtered[0]?.id || null) : state.currentId
        };
      });

      toast.success('对话删除成功');
    } catch (error: any) {
      console.error('Failed to delete conversation:', error);
      toast.error('删除对话失败');
      throw error;
    }
  },

  updateConversation: (id: string, data: Partial<Conversation>) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c
      )
    }));
  },

  setCurrentConversation: (id: string | null) => {
    set({ currentId: id });
  }
}));
