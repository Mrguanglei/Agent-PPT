'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAgentStream } from '@/hooks/useAgentStream';
import { useToolPanelStore } from '@/stores/toolPanelStore';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { WelcomeScreen } from './WelcomeScreen';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2, Info } from 'lucide-react';
import { API_URL } from '@/lib/constants';
import type { Message, ToolCallInMessage } from '@/types/message';

interface ChatContainerProps {
  chatId?: string;
}

export function ChatContainer({ chatId }: ChatContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [agentRunId, setAgentRunId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 用于收集当前消息的工具调用
  const [currentToolCalls, setCurrentToolCalls] = useState<ToolCallInMessage[]>([]);

  const { isOpen: isToolPanelOpen } = useToolPanelStore();

  // 使用 ref 存储最新的状态，避免闭包陷阱
  const streamingContentRef = useRef(streamingContent);
  const currentToolCallsRef = useRef(currentToolCalls);
  const chatIdRef = useRef(chatId);

  // 更新 refs
  useEffect(() => {
    streamingContentRef.current = streamingContent;
    currentToolCallsRef.current = currentToolCalls;
    chatIdRef.current = chatId;
  }, [streamingContent, currentToolCalls, chatId]);

  // 加载历史消息
  useEffect(() => {
    if (!chatId) return;

    const loadMessages = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_URL}/api/v1/chats/${chatId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Chat data:', data);
        }
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [chatId]);

  // Auto scroll to bottom
  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, scrollToBottom]);

  // 使用 useCallback 稳定回调函数
  const handleComplete = useCallback(() => {
    // 使用 ref 获取最新值
    const content = streamingContentRef.current;
    const tools = currentToolCallsRef.current;
    const currentChatId = chatIdRef.current;

    if (content || tools.length > 0) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          chat_id: currentChatId || '',
          role: 'assistant',
          content: content,
          tool_calls: tools,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);
      setStreamingContent('');
      setCurrentToolCalls([]);
    }
    setIsStreaming(false);
    setAgentRunId(null);
  }, []);

  const handleError = useCallback((error: string) => {
    console.error('Agent error:', error);
    setIsStreaming(false);
    setAgentRunId(null);
  }, []);

  const handleMessage = useCallback((content: string) => {
    setStreamingContent((prev) => prev + content);
  }, []);

  const handleToolCallStart = useCallback((index: number, name: string) => {
    // 添加新的工具调用
    const newToolCall: ToolCallInMessage = {
      index,
      name,
      status: 'running',
    };
    setCurrentToolCalls((prev) => [...prev, newToolCall]);

    // 自动打开第一个工具的面板
    if (index === 0) {
      const { openPanel } = useToolPanelStore.getState();
      openPanel(0);
    }
  }, []);

  const handleToolCallProgress = useCallback((index: number, name: string, status: any, params?: any) => {
    // 更新工具调用状态
    setCurrentToolCalls((prev) =>
      prev.map((tc) =>
        tc.index === index ? { ...tc, status, params } : tc
      )
    );
  }, []);

  const handleToolCallComplete = useCallback((index: number, name: string, status: any, result?: any, error?: string) => {
    // 更新工具调用完成状态
    setCurrentToolCalls((prev) =>
      prev.map((tc) =>
        tc.index === index
          ? { ...tc, status, result, error }
          : tc
      )
    );
  }, []);

  // SSE stream handling
  useAgentStream({
    agentRunId,
    onMessage: handleMessage,
    onToolCallStart: handleToolCallStart,
    onToolCallProgress: handleToolCallProgress,
    onToolCallComplete: handleToolCallComplete,
    onComplete: handleComplete,
    onError: handleError,
  });

  // Send message
  const handleSend = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      chat_id: chatId || '',
      role: 'user',
      content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsStreaming(true);
    setCurrentToolCalls([]);

    try {
      const response = await fetch(`${API_URL}/api/v1/agent/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          chat_id: chatId || null,
          message: content,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      setAgentRunId(data.agent_run_id);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsStreaming(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm font-medium text-muted-foreground">正在加载对话...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="flex-1 flex flex-col min-h-0 bg-background"
      animate={{
        marginRight: (() => {
          if (!isToolPanelOpen) return 0;
          if (typeof window !== 'undefined' && window.innerWidth > 56 * 16) {
            return 56 * 16;
          }
          return 0;
        })(),
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }}
    >
      {/* Message Area */}
      <ScrollArea className="flex-1">
        <div className="max-w-4xl mx-auto w-full">
          {!chatId && messages.length === 0 ? (
            <WelcomeScreen onSend={handleSend} />
          ) : (
            <div className="flex flex-col w-full">
              <MessageList
                messages={messages}
                streamingContent={streamingContent}
                isStreaming={isStreaming}
                currentToolCalls={currentToolCalls}
              />
              <div ref={scrollRef} className="h-4" />
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area - Floating style like ChatGLM */}
      <div className="w-full bg-gradient-to-t from-background via-background to-transparent pt-10 relative">
        {/* 状态提示条 - ChatGLM 风格 */}
        <AnimatePresence>
          {isStreaming && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute -top-2 left-1/2 -translate-x-1/2 z-30"
            >
              <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-card border border-border shadow-lg backdrop-blur-md">
                <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                <span className="text-[11px] font-bold text-foreground/80 uppercase tracking-wider">
                  {currentToolCalls.length > 0 ? '正在执行任务规划...' : '正在思考中...'}
                </span>
                <div className="w-px h-3 bg-border mx-1" />
                <span className="text-[10px] text-muted-foreground">您可以随时离开，任务将在后台继续</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <ChatInput onSend={handleSend} disabled={isStreaming} />
      </div>
    </motion.div>
  );
}
