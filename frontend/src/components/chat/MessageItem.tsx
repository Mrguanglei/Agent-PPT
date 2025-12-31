'use client';

import { Message as MessageType, ToolCallInMessage } from '@/types/message';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDate } from '@/lib/utils';
import { ToolCallButton } from '@/components/tool-panel/ToolCallButton';
import { InteractionCard } from './InteractionCard';
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
    <div className={cn(
      'flex gap-4 w-full py-6 px-4 transition-colors hover:bg-muted/5',
      isUser ? 'flex-row-reverse' : 'flex-row'
    )}>
      {/* 头像 */}
      <Avatar className="h-9 w-9 flex-shrink-0 border border-border/50 shadow-sm">
        {isUser ? (
          <AvatarFallback className="bg-primary text-primary-foreground font-bold">U</AvatarFallback>
        ) : (
          <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold">
            AI
          </AvatarFallback>
        )}
      </Avatar>

      {/* 消息内容区 */}
      <div className={cn(
        'flex flex-col max-w-[85%] gap-2',
        isUser ? 'items-end' : 'items-start'
      )}>
        {/* 角色与时间 */}
        <div className={cn(
          'flex items-center gap-2 mb-1',
          isUser ? 'flex-row-reverse' : 'flex-row'
        )}>
          <span className="text-sm font-bold text-foreground/90">
            {isUser ? '您' : 'PPT Agent'}
          </span>
          <span className="text-[11px] text-muted-foreground font-medium">
            {formatDate(message.created_at)}
          </span>
        </div>

        {/* 文本消息气泡 */}
        {message.content && (
          <div className={cn(
            'relative px-5 py-3.5 rounded-2xl shadow-sm leading-relaxed text-[15px]',
            isUser
              ? 'bg-primary text-primary-foreground rounded-tr-none'
              : 'bg-card border border-border/50 text-foreground rounded-tl-none'
          )}>
            <p className="whitespace-pre-wrap">
              {message.content}
            </p>
          </div>
        )}

        {/* 交互卡片展示区 - ChatGLM 风格 */}
        {message.interaction_card && (
          <InteractionCard card={message.interaction_card} />
        )}

        {/* 工具调用展示区 - 模仿 ChatGLM 风格 */}
        {toolCalls.length > 0 && (
          <div className={cn(
            'flex flex-col gap-3 w-full mt-2',
            isUser ? 'items-end' : 'items-start'
          )}>
            <div className="flex flex-col gap-2 w-full max-w-md">
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
        )}
      </div>
    </div>
  );
}
