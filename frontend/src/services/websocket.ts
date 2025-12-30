import { io, Socket } from 'socket.io-client';
import type { AgentStreamMessage } from '@/types';

export class AgentWebSocket {
  private socket: Socket | null = null;
  private messageHandlers: ((message: AgentStreamMessage) => void)[] = [];
  private conversationId: string | null = null;

  constructor() {
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.addMessageHandler = this.addMessageHandler.bind(this);
    this.removeMessageHandler = this.removeMessageHandler.bind(this);
  }

  connect(conversationId: string) {
    if (this.socket) {
      this.disconnect();
    }

    this.conversationId = conversationId;
    const token = localStorage.getItem('auth_token');

    // Socket.IO URL
    const socketUrl = `${window.location.protocol}//${window.location.host}`;

    this.socket = io(socketUrl, {
      path: '/api/socket.io',
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('Socket.IO connected');
      // Join conversation room
      this.socket?.emit('join_conversation', { conversation_id: conversationId });
    });

    this.socket.on('disconnect', () => {
      console.log('Socket.IO disconnected');
    });

    this.socket.on('agent_message', (message: AgentStreamMessage) => {
      this.messageHandlers.forEach(handler => handler(message));
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.conversationId = null;
    }
  }

  sendMessage(message: string, projectId?: string) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('agent_message', {
        message,
        project_id: projectId,
        conversation_id: this.conversationId
      });
    } else {
      console.warn('Socket.IO is not connected');
    }
  }

  addMessageHandler(handler: (message: AgentStreamMessage) => void) {
    this.messageHandlers.push(handler);
  }

  removeMessageHandler(handler: (message: AgentStreamMessage) => void) {
    this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
  }

  get isConnected(): boolean {
    return this.socket?.connected || false;
  }

  get currentConversationId(): string | null {
    return this.conversationId;
  }
}

// Singleton instance
export const agentWebSocket = new AgentWebSocket();
