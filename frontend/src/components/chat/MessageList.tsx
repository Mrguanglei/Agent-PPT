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
        <div className="flex gap-3 animate-in">
          <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-primary-foreground text-xs font-bold">AI</span>
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-foreground">PPT Agent</p>
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            </div>

            {streamingContent && (
              <div className="bg-muted text-foreground max-w-[80%] rounded-2xl px-4 py-3 shadow-sm">
                <p className="whitespace-pre-wrap leading-relaxed">
                  {streamingContent}
                </p>
              </div>
            )}

            {/* Show tool calls in real-time (one per line) */}
            {currentToolCalls.length > 0 && (
              <div className="space-y-3 max-w-[80%]">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  正在执行工具
                </p>
                <div className="flex flex-col gap-3">
                  {currentToolCalls.map((toolCall) => (
                    <div key={toolCall.index} className="card-modern p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-info animate-pulse flex-shrink-0" />
                            <div className="text-sm font-medium truncate">{toolCall.name}</div>
                            <div className="text-xs text-muted-foreground ml-2">{toolCall.status}</div>
                          </div>
                          {toolCall.params && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              <pre className="whitespace-pre-wrap max-h-28 overflow-auto text-xs">
                                {typeof toolCall.params === 'string' ? toolCall.params : JSON.stringify(toolCall.params, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          <span className={toolCall.status === 'running' ? 'text-info text-xs' : 'text-muted-foreground text-xs'}>
                            {toolCall.status === 'running' ? '执行中' : toolCall.status === 'success' ? '完成' : toolCall.status === 'failed' ? '失败' : '等待'}
                          </span>
                        </div>
                      </div>
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
