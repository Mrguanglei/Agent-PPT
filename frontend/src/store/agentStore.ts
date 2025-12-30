import { create } from 'zustand';
import type { AgentState, Message, ToolCallState } from '@/types';
import { agentApi } from '@/services/api';
import { agentEventSource } from '@/services/eventsource';
import toast from 'react-hot-toast';

export const useAgentStore = create<AgentState>((set: any, get: any) => ({
  messages: [],
  currentConversationId: null,
  isProcessing: false,
  currentToolCall: null,

  sendMessage: async (message: string, projectId?: string) => {
    const { currentConversationId } = get();

    // 如果没有对话ID，抛出错误而不是自动创建
    if (!currentConversationId) {
      throw new Error('No conversation selected');
    }

    const conversationId = currentConversationId;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date(),
    };

    set((state: any) => ({
      messages: [...state.messages, userMessage],
      isProcessing: true,
    }));

    try {
      // 发送消息到后端API（异步处理）
      await agentApi.sendMessage(conversationId, {
        message,
        project_id: projectId,
      });

      // 连接EventSource监听响应
      agentEventSource.connect(conversationId);

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

          set((state: any) => ({
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

          set((state: any) => ({
            messages: [...state.messages, toolMessage],
          }));
        } else if (streamMessage.type === 'tool_call_complete') {
          // Update tool call completion
          set((state: any) => ({
            currentToolCall: state.currentToolCall ? {
              ...state.currentToolCall,
              status: 'completed',
              result: streamMessage.data.result,
            } : null,
            isProcessing: false,
          }));

          // Update last tool message
          set((state: any) => ({
            messages: state.messages.map((msg: any) =>
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

      agentEventSource.addMessageHandler(handleMessage);

      // Clean up handler after processing (longer timeout for async processing)
      setTimeout(() => {
        agentEventSource.removeMessageHandler(handleMessage);
      }, 120000); // 2 minute timeout for async processing

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

      // Connect EventSource
      agentEventSource.connect(conversationId);

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
    agentEventSource.disconnect();
  },
}));
