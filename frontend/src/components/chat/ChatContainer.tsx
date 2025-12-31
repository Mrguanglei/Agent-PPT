'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAgentStream } from '@/hooks/useAgentStream';
import { useToolPanelStore } from '@/stores/toolPanelStore';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { WelcomeScreen } from './WelcomeScreen';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';
import { API_URL } from '@/lib/constants';
import type { Message, ToolCallInMessage } from '@/types/message';
import { cn } from '@/lib/utils';

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
  const [currentToolCalls, setCurrentToolCalls] = useState<ToolCallInMessage[]>([]);

  const { isOpen: isToolPanelOpen } = useToolPanelStore();

  const streamingContentRef = useRef(streamingContent);
  const currentToolCallsRef = useRef(currentToolCalls);
  const chatIdRef = useRef(chatId);

  useEffect(() => {
    streamingContentRef.current = streamingContent;
    currentToolCallsRef.current = currentToolCalls;
    chatIdRef.current = chatId;
  }, [streamingContent, currentToolCalls, chatId]);

  // 加载历史消息
  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      return;
    }

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
          setMessages(data.messages || []);
        }
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [chatId]);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, currentToolCalls, scrollToBottom]);

  const handleComplete = useCallback(() => {
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
    const newToolCall: ToolCallInMessage = {
      index,
      name,
      status: 'running',
    };
    setCurrentToolCalls((prev) => [...prev, newToolCall]);
  }, []);

  const handleToolCallProgress = useCallback((index: number, name: string, status: any, params?: any) => {
    setCurrentToolCalls((prev) =>
      prev.map((tc) =>
        tc.index === index ? { ...tc, status, params } : tc
      )
    );
  }, []);

  const handleToolCallComplete = useCallback((index: number, name: string, status: any, result?: any, error?: string) => {
    setCurrentToolCalls((prev) =>
      prev.map((tc) =>
        tc.index === index
          ? { ...tc, status, result, error }
          : tc
      )
    );
  }, []);

  useAgentStream({
    agentRunId,
    onMessage: handleMessage,
    onToolCallStart: handleToolCallStart,
    onToolCallProgress: handleToolCallProgress,
    onToolCallComplete: handleToolCallComplete,
    onComplete: handleComplete,
    onError: handleError,
  });

  const handleSend = async (content: string) => {
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

  const isInitialState = !chatId && messages.length === 0;

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm font-medium text-muted-foreground">正在加载对话...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      {/* Message Area - 只有这里滚动 */}
      <div className="flex-1 overflow-y-auto scrollbar-none">
        <div className={cn(
          "max-w-4xl mx-auto w-full px-4",
          isInitialState ? "h-full flex items-center justify-center" : "py-8"
        )}>
          {isInitialState ? (
            <WelcomeScreen onSend={handleSend} />
          ) : (
            <div className="flex flex-col w-full">
              <MessageList
                messages={messages}
                streamingContent={streamingContent}
                isStreaming={isStreaming}
                currentToolCalls={currentToolCalls}
              />
              <div ref={scrollRef} className="h-20" />
            </div>
          )}
        </div>
      </div>

      {/* Input Area - 固定在底部 */}
      <div className={cn(
        "w-full bg-gradient-to-t from-background via-background to-transparent pb-8 pt-10 px-4 z-20",
        isInitialState ? "absolute bottom-0 left-0 right-0" : "relative"
      )}>
        <div className="max-w-4xl mx-auto w-full relative">
          {/* 状态提示条 - 仅在非初始状态且正在流式输出时显示在输入框上方 */}
          {!isInitialState && isStreaming && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute -top-12 left-1/2 -translate-x-1/2 z-30"
              >
                <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-card border border-border shadow-lg backdrop-blur-md">
                  <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                  <span className="text-[11px] font-bold text-foreground/80 uppercase tracking-wider">
                    {currentToolCalls.length > 0 ? '正在执行任务规划...' : '正在思考中...'}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          <ChatInput onSend={handleSend} disabled={isStreaming} />
          
          {!isInitialState && (
            <p className="text-[10px] text-center text-muted-foreground mt-3">
              Agent-PPT 可能会产生错误，请核查重要信息。
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
