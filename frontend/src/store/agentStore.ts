import { create } from 'zustand';
import type { AgentState, Message, ToolCallState, Conversation } from '@/types';
import { agentApi } from '@/services/api';
import { agentWebSocket } from '@/services/websocket';
import toast from 'react-hot-toast';

export const useAgentStore = create<AgentState>((set, get) => ({
  messages: [],
  currentConversationId: null,
  isProcessing: false,
  currentToolCall: null,

  sendMessage: async (message: string, projectId?: string) => {
    const { currentConversationId } = get();

    if (!currentConversationId) {
      await get().createConversation(projectId);
    }

    const conversationId = get().currentConversationId;
    if (!conversationId) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date(),
    };

    set(state => ({
      messages: [...state.messages, userMessage],
      isProcessing: true,
    }));

    try {
      // Send message via WebSocket
      agentWebSocket.sendMessage(message, projectId);

      // Set up message handler for responses
      const handleMessage = (streamMessage: any) => {
        if (streamMessage.type === 'message') {
          // Add assistant message
          const assistantMessage: Message = {
            id: Date.now().toString(),
            type: 'assistant',
            content: streamMessage.data.content,
            timestamp: new Date(),
          };

          set(state => ({
            messages: [...state.messages, assistantMessage],
          }));
        } else if (streamMessage.type === 'tool_call_start') {
          // Update tool call state
          const toolCall: ToolCallState = {
            tool: streamMessage.data.tool,
            status: 'processing',
          };

          set({ currentToolCall: toolCall });

          // Add tool message
          const toolMessage: Message = {
            id: Date.now().toString(),
            type: 'tool',
            content: `正在执行 ${streamMessage.data.tool}...`,
            timestamp: new Date(),
            toolCall,
          };

          set(state => ({
            messages: [...state.messages, toolMessage],
          }));
        } else if (streamMessage.type === 'tool_call_complete') {
          // Update tool call completion
          set(state => ({
            currentToolCall: state.currentToolCall ? {
              ...state.currentToolCall,
              status: 'completed',
              result: streamMessage.data.result,
            } : null,
            isProcessing: false,
          }));

          // Update last tool message
          set(state => ({
            messages: state.messages.map(msg =>
              msg.toolCall ? {
                ...msg,
                content: `${streamMessage.data.tool} 执行完成`,
                toolCall: {
                  ...msg.toolCall,
                  status: 'completed',
                  result: streamMessage.data.result,
                },
              } : msg
            ),
          }));
        } else if (streamMessage.type === 'error') {
          set({ isProcessing: false });
          toast.error(streamMessage.data.message);
        }
      };

      agentWebSocket.addMessageHandler(handleMessage);

      // Clean up handler after processing
      setTimeout(() => {
        agentWebSocket.removeMessageHandler(handleMessage);
      }, 30000); // 30 second timeout

    } catch (error: any) {
      console.error('Failed to send message:', error);
      toast.error('发送消息失败');
      set({ isProcessing: false });
    }
  },

  createConversation: async (projectId?: string) => {
    try {
      const response = await agentApi.createConversation({
        project_id: projectId,
        messages: [],
        agent_state: {},
      });

      const conversationId = response.data.id;
      set({ currentConversationId: conversationId });

      // Connect WebSocket
      agentWebSocket.connect(conversationId);

      return conversationId;
    } catch (error: any) {
      console.error('Failed to create conversation:', error);
      toast.error('创建对话失败');
      throw error;
    }
  },

  clearMessages: () => {
    set({
      messages: [],
      currentConversationId: null,
      isProcessing: false,
      currentToolCall: null,
    });
    agentWebSocket.disconnect();
  },
}));
