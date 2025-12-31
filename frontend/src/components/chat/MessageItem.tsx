'use client';

import { Message as MessageType, ToolCallInMessage } from '@/types/message';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDate } from '@/lib/utils';
import { ToolCallButton } from '@/components/tool-panel/ToolCallButton';
import { useToolPanelStore } from '@/stores/toolPanelStore';
import { cn } from '@/lib/utils';

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
          <AvatarFallback className="bg-gradient-primary text-primary-foreground">
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

        <div className={cn(
          'max-w-[720px] rounded-2xl px-4 py-3 shadow-sm',
          isUser
            ? 'bg-card text-foreground ml-auto' // 用户气泡为白色卡片并右对齐
            : 'bg-muted text-foreground'
        )}>
          <p className={cn('whitespace-pre-wrap leading-relaxed', isUser ? 'text-foreground' : 'text-foreground')}>
            {message.content}
          </p>
        </div>

        {/* Tool Call Buttons - 按顺序往下显示 */}
        {toolCalls.length > 0 && (
          <div className={cn(
            'max-w-[80%] rounded-2xl px-4 py-3',
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-foreground'
          )}>
            <div className="space-y-2">
              <p className={cn(
                'text-xs font-medium uppercase tracking-wide',
                isUser ? 'text-primary-foreground/80' : 'text-muted-foreground'
              )}>
                已执行工具
              </p>
              <div className="flex flex-wrap gap-2">
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
