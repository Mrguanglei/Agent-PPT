import { useEffect, useRef, useState } from 'react';
import { agentWebSocket } from '@/services/websocket';
import type { AgentStreamMessage } from '@/types';

export const useWebSocket = (conversationId: string | null) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<AgentStreamMessage | null>(null);
  const messageHandlersRef = useRef<((message: AgentStreamMessage) => void)[]>([]);

  useEffect(() => {
    if (!conversationId) {
      setIsConnected(false);
      return;
    }

    // Connect to WebSocket
    agentWebSocket.connect(conversationId);
    setIsConnected(agentWebSocket.isConnected);

    // Set up message handler
    const handleMessage = (message: AgentStreamMessage) => {
      setLastMessage(message);
      // Call all registered handlers
      messageHandlersRef.current.forEach(handler => handler(message));
    };

    agentWebSocket.addMessageHandler(handleMessage);

    // Check connection status periodically
    const connectionCheck = setInterval(() => {
      setIsConnected(agentWebSocket.isConnected);
    }, 1000);

    return () => {
      agentWebSocket.removeMessageHandler(handleMessage);
      clearInterval(connectionCheck);
    };
  }, [conversationId]);

  const sendMessage = (message: string, projectId?: string) => {
    agentWebSocket.sendMessage(message, projectId);
  };

  const addMessageHandler = (handler: (message: AgentStreamMessage) => void) => {
    messageHandlersRef.current.push(handler);
  };

  const removeMessageHandler = (handler: (message: AgentStreamMessage) => void) => {
    messageHandlersRef.current = messageHandlersRef.current.filter(h => h !== handler);
  };

  const disconnect = () => {
    agentWebSocket.disconnect();
    setIsConnected(false);
  };

  return {
    isConnected,
    lastMessage,
    sendMessage,
    addMessageHandler,
    removeMessageHandler,
    disconnect,
  };
};
