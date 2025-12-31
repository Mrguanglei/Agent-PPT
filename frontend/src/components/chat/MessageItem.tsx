'use client';

import { Message as MessageType, ToolCallInMessage } from '@/types/message';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDate } from '@/lib/utils';
import { ToolCallButton } from '@/components/tool-panel/ToolCallButton';
import { InteractionCard } from './InteractionCard';
import { PPTProgressCard } from './PPTProgressCard';
import { PPTPreviewModal } from './PPTPreviewModal';
import { useToolPanelStore } from '@/stores/toolPanelStore';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, RotateCcw, ThumbsUp, Share2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MessageProps {
  message: MessageType;
  isStreaming?: boolean;
  currentToolCalls?: ToolCallInMessage[];
}

export function MessageItem({ message, isStreaming, currentToolCalls }: MessageProps) {
  const isUser = message.role === 'user';
  const { selectTool, openPanel } = useToolPanelStore();
  const [copied, setCopied] = useState(false);

  // 过滤掉内容中的原始工具调用标签，保持界面整洁
  const cleanContent = message.content.replace(/<tool_call>[\s\S]*?<\/tool_call>/g, '').trim();

  // Extract tool calls from message metadata
  const toolCalls = message.tool_calls || [];

  // Handle tool click - open panel and select the tool
  const handleToolClick = (index: number) => {
    selectTool(index);
    openPanel();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex gap-4 w-full py-6 px-4 transition-colors hover:bg-muted/5 group',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* 头像 */}
      <Avatar className={cn(
        "h-10 w-10 flex-shrink-0 border-2 shadow-sm transition-transform group-hover:scale-105",
        isUser ? "border-border/50" : "border-primary/10"
      )}>
        {isUser ? (
          <>
            <AvatarImage src="/user-avatar.png" />
            <AvatarFallback className="bg-muted text-muted-foreground font-bold text-xs">U</AvatarFallback>
          </>
        ) : (
          <>
            <AvatarImage src="/ai-avatar.png" />
            <AvatarFallback className="bg-primary text-primary-foreground font-black text-xs">AI</AvatarFallback>
          </>
        )}
      </Avatar>

      {/* 消息内容区 */}
      <div className={cn(
        'flex flex-col max-w-[85%] gap-2',
        isUser ? 'items-end' : 'items-start'
      )}>
        {/* 角色与时间 */}
        <div className={cn(
          'flex items-center gap-2 mb-1 px-1',
          isUser ? 'flex-row-reverse' : 'flex-row'
        )}>
          <span className="text-[11px] font-black text-foreground/40 uppercase tracking-widest">
            {isUser ? '您' : 'PPT Agent'}
          </span>
          <span className="text-[10px] text-muted-foreground/40 font-medium">
            {formatDate(message.created_at)}
          </span>
        </div>

        {/* 文本消息气泡 - 像素级重构 */}
        {(cleanContent || (isStreaming && !isUser)) && (
          <div className={cn(
            'relative px-5 py-4 rounded-[24px] shadow-sm leading-relaxed text-[15px] transition-all',
            isUser
              ? 'bg-primary text-primary-foreground rounded-tr-none shadow-primary/10'
              : 'bg-card border border-border/50 text-foreground rounded-tl-none'
          )}>
            {cleanContent ? (
              <div className="whitespace-pre-wrap break-words font-medium">
                {cleanContent}
              </div>
            ) : isStreaming && !isUser ? (
              <div className="flex items-center gap-1.5 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            ) : null}
          </div>
        )}

        {/* 交互卡片展示区 - ChatGLM 风格 */}
        {message.interaction_card && (
          <InteractionCard card={message.interaction_card} />
        )}

        {/* 工具调用展示区 - 模仿 ChatGLM 风格 */}
        {(toolCalls.length > 0 || (currentToolCalls && currentToolCalls.length > 0)) && (
          <div className={cn(
            'flex flex-col gap-3 w-full mt-2',
            isUser ? 'items-end' : 'items-start'
          )}>
            <div className="flex flex-col gap-2 w-full max-w-md">
              {/* 正在进行的工具调用 */}
              {currentToolCalls?.map((tc) => (
                <ToolCallButton
                  key={tc.index}
                  index={tc.index}
                  name={tc.name}
                  status={tc.status}
                  onClick={() => handleToolClick(tc.index)}
                />
              ))}
              {/* 已完成的工具调用 */}
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

        {/* 操作按钮栏 - 仅在悬浮时显示 */}
        <div className={cn(
          "flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
          isUser && "flex-row-reverse"
        )}>
          <Button variant="ghost" size="icon" onClick={handleCopy} className="h-8 w-8 rounded-full hover:bg-muted">
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
          {!isUser && (
            <>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted">
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted">
                <ThumbsUp className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted">
                <Share2 className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted">
            <MoreHorizontal className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
