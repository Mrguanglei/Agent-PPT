'use client';

import { Message as MessageType, ToolCallInMessage } from '@/types/message';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDate } from '@/lib/utils';
import { ToolCallButton } from '@/components/tool-panel/ToolCallButton';
import { useToolPanelStore } from '@/stores/toolPanelStore';

interface MessageProps {
  message: MessageType;
}

export function MessageItem({ message }: MessageProps) {
  const isUser = message.role === 'user';
  const { selectTool, openPanel } = useToolPanelStore();

  // Extract tool calls from message metadata
  const toolCalls = message.tool_calls || [];

  // Handle tool click - open panel and select the tool
  const handleToolClick = (index: number) => {
    selectTool(index);
    openPanel();
  };

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        {isUser ? (
          <AvatarFallback className="bg-primary text-primary-foreground">U</AvatarFallback>
        ) : (
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            AI
          </AvatarFallback>
        )}
      </Avatar>

      <div className={`flex-1 space-y-2 ${isUser ? 'items-end' : ''}`}>
        <div className={`flex items-center gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
          <p className="text-sm font-medium text-foreground">
            {isUser ? 'You' : 'PPT Agent'}
          </p>
          <span className="text-xs text-muted-foreground">{formatDate(message.created_at)}</span>
        </div>

        <div className={`prose prose-invert prose-sm max-w-[80%] ${isUser ? 'ml-auto' : ''}`}>
          <p className="text-foreground whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Tool Call Buttons - 按顺序往下显示 */}
        {toolCalls.length > 0 && (
          <div className="flex flex-col gap-2 pt-2">
            {toolCalls.map((toolCall) => (
              <ToolCallButton
                key={toolCall.index}
                index={toolCall.index}
                name={toolCall.name}
                status={toolCall.status}
                onClick={() => handleToolClick(toolCall.index)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
