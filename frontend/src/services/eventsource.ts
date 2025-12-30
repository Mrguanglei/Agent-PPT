import type { AgentStreamMessage } from '@/types';

export class AgentEventSource {
  private eventSource: EventSource | null = null;
  private messageHandlers: ((message: AgentStreamMessage) => void)[] = [];
  private conversationId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor() {
    this.addMessageHandler = this.addMessageHandler.bind(this);
    this.removeMessageHandler = this.removeMessageHandler.bind(this);
  }

  connect(conversationId: string) {
    if (this.eventSource && this.conversationId === conversationId) {
      console.log('EventSource already connected to the same conversation');
      return;
    }

    // 如果连接到不同的对话，先断开
    if (this.eventSource && this.conversationId !== conversationId) {
      console.log('Switching to different conversation, disconnecting...');
      this.disconnect();
    }

    this.conversationId = conversationId;

    // 获取认证token
    const token = localStorage.getItem('auth_token');
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:18000';
    const streamUrl = `${baseUrl}/api/agent/conversations/${conversationId}/stream`;

    console.log('Creating EventSource connection to:', streamUrl);

    try {
      this.eventSource = new EventSource(streamUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      } as any); // TypeScript doesn't support headers in EventSource constructor

      this.eventSource.onopen = () => {
        console.log('EventSource connected successfully');
        this.reconnectAttempts = 0;
      };

      this.eventSource.onmessage = (event) => {
        try {
          const message: AgentStreamMessage = JSON.parse(event.data);
          this.messageHandlers.forEach(handler => handler(message));
        } catch (e) {
          console.error('Failed to parse EventSource message:', e);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('EventSource connection error:', error);

        // 尝试重连
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

          setTimeout(() => {
            this.connect(conversationId);
          }, this.reconnectDelay * this.reconnectAttempts);
        } else {
          console.error('Max reconnection attempts reached');
          this.disconnect();
        }
      };

    } catch (error) {
      console.error('Failed to create EventSource connection:', error);
      this.conversationId = null;
    }
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      this.conversationId = null;
      this.reconnectAttempts = 0;
    }
  }

  addMessageHandler(handler: (message: AgentStreamMessage) => void) {
    this.messageHandlers.push(handler);
  }

  removeMessageHandler(handler: (message: AgentStreamMessage) => void) {
    this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
  }

  get isConnected(): boolean {
    return this.eventSource?.readyState === EventSource.OPEN;
  }

  get currentConversationId(): string | null {
    return this.conversationId;
  }
}

// 单例实例
export const agentEventSource = new AgentEventSource();
