'use client';

import { Message, ToolCallInMessage } from '@/types/message';
import { MessageItem } from './MessageItem';

interface MessageListProps {
  messages: Message[];
  streamingContent?: string;
  isStreaming?: boolean;
  currentToolCalls?: ToolCallInMessage[];
}

export function MessageList({ messages, streamingContent, isStreaming, currentToolCalls = [] }: MessageListProps) {
  return (
    <div className="space-y-8">
      {messages.map((msg) => (
        <MessageItem key={msg.id} message={msg} />
      ))}

      {/* Streaming assistant message with tool calls */}
      {isStreaming && (streamingContent || currentToolCalls.length > 0) && (
        <div className="flex gap-4 animate-in">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0 shadow-modern">
            <span className="text-white text-sm font-bold">AI</span>
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground">PPT Agent</p>
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            </div>

            {streamingContent && (
              <div className="card-modern p-4">
                <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                  {streamingContent}
                </p>
              </div>
            )}

            {/* Show tool calls in real-time */}
            {currentToolCalls.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  正在执行工具
                </p>
                <div className="flex flex-wrap gap-2">
                  {currentToolCalls.map((toolCall) => (
                    <div
                      key={toolCall.index}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-info/10 border border-info/20 text-info shadow-sm"
                    >
                      <div className="w-2 h-2 rounded-full bg-info animate-pulse" />
                      <span>{toolCall.name}</span>
                      <span className="text-xs opacity-75">
                        {toolCall.status === 'running' ? '执行中' :
                         toolCall.status === 'success' ? '完成' :
                         toolCall.status === 'failed' ? '失败' : '等待中'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
