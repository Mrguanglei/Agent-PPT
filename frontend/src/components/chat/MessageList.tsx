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
    <div className="space-y-6">
      {messages.map((msg) => (
        <MessageItem key={msg.id} message={msg} />
      ))}

      {/* Streaming assistant message with tool calls */}
      {isStreaming && (streamingContent || currentToolCalls.length > 0) && (
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">AI</span>
          </div>
          <div className="flex-1 space-y-2">
            <p className="text-sm font-medium text-foreground">PPT Agent</p>

            {streamingContent && (
              <div className="prose prose-invert prose-sm max-w-none">
                <p className="text-foreground whitespace-pre-wrap">{streamingContent}</p>
              </div>
            )}

            {/* Show tool calls in real-time */}
            {currentToolCalls.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {currentToolCalls.map((toolCall) => (
                  <div
                    key={toolCall.index}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border bg-primary/10 border-primary/30 text-primary"
                  >
                    <span>{toolCall.name}</span>
                    {toolCall.status === 'running' && (
                      <span className="animate-pulse">执行中...</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
