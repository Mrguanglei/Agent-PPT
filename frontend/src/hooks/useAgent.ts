import { useEffect } from 'react';
import { useAgentStore } from '@/store';
import { useWebSocket } from './useWebSocket';
import type { AgentStreamMessage } from '@/types';

export const useAgent = (projectId?: string) => {
  const agentStore = useAgentStore();
  const { addMessageHandler } = useWebSocket(agentStore.currentConversationId);

  useEffect(() => {
    // Set up WebSocket message handler
    const handleWebSocketMessage = (message: AgentStreamMessage) => {
      if (message.type === 'message') {
        // Add assistant message
        const assistantMessage = {
          id: Date.now().toString(),
          type: 'assistant' as const,
          content: message.data.content,
          timestamp: new Date(),
        };

        useAgentStore.getState().messages.push(assistantMessage);
      } else if (message.type === 'tool_call_start') {
        // Update tool call state
        useAgentStore.setState({
          currentToolCall: {
            tool: message.data.tool,
            status: 'processing',
          },
        });
      } else if (message.type === 'tool_call_complete') {
        // Update tool call completion
        useAgentStore.setState(state => ({
          currentToolCall: state.currentToolCall ? {
            ...state.currentToolCall,
            status: 'completed',
            result: message.data.result,
          } : null,
          isProcessing: false,
        }));
      } else if (message.type === 'error') {
        // Handle error
        useAgentStore.setState({
          isProcessing: false,
          currentToolCall: null,
        });
        console.error('Agent error:', message.data.message);
      }
    };

    addMessageHandler(handleWebSocketMessage);

    // Cleanup function will be handled by useWebSocket
  }, [addMessageHandler]);

  return agentStore;
};
