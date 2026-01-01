'use client';

import { Message as MessageType, ToolCallInMessage } from '@/types/message';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDate } from '@/lib/utils';
import { InteractionCard } from './InteractionCard';
import { PPTProgressCard } from './PPTProgressCard';
import { PPTPreviewModal } from './PPTPreviewModal';
import { useToolPanelStore } from '@/stores/toolPanelStore';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, RotateCcw, ThumbsUp, Share2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToolCallButton } from '@/components/tool-panel/ToolCallButton';

interface MessageProps {
  message: MessageType;
  isStreaming?: boolean;
  currentToolCalls?: ToolCallInMessage[];
}

export function MessageItem({ message, isStreaming, currentToolCalls }: MessageProps) {
  const isUser = message.role === 'user';
  const { openPanel } = useToolPanelStore();
  const [copied, setCopied] = useState(false);

  // 过滤掉内容中的原始工具调用标签，保持界面整洁
  const cleanContent = message.content.replace(/<tool_call>[\s\S]*?<\/tool_call>/g, '').trim();

  // Extract tool calls from message metadata
  const toolCalls = message.tool_calls || [];

  // Handle tool click - directly show the tool result in panel, not from global store
  const handleToolClick = (index: number) => {
    const toolCall = toolCalls.find(tc => tc.index === index);
    if (!toolCall) return;

    // Temporarily add this tool call to the store for display
    const { addToolCall, clearToolCalls } = useToolPanelStore.getState();

    // Clear and add only this message's tool calls
    clearToolCalls();
    toolCalls.forEach(tc => {
      addToolCall({
        index: tc.index,
        name: tc.name,
        status: tc.status,
        params: tc.params,
        result: tc.result,
        error: tc.error,
        executionTime: tc.executionTime,
      });
    });

    // Open panel with the selected tool
    openPanel(index);
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
        'w-full py-6 px-4 transition-colors hover:bg-muted/5 group',
        isUser ? 'flex justify-end' : 'flex flex-col gap-2'
      )}
    >
      {isUser ? (
        // 用户消息布局：右对齐
        <>
          <div className="flex flex-col max-w-[85%] items-end gap-2">
            {/* 角色与时间 */}
            <div className="flex items-center gap-2 mb-1 px-1 flex-row-reverse">
              <span className="text-[11px] font-black text-foreground/40 uppercase tracking-widest">
                您
              </span>
              <span className="text-[10px] text-muted-foreground/40 font-medium">
                {formatDate(message.created_at)}
              </span>
            </div>

            {/* 文本消息气泡 */}
            {(cleanContent || (isStreaming && !isUser)) && (
              <div className="max-w-[90%] px-4 py-3 bg-primary text-primary-foreground rounded-3xl rounded-br-lg shadow-sm leading-relaxed text-[15px] transition-all break-words overflow-hidden">
                <div className="whitespace-pre-wrap break-words font-medium">
                  {cleanContent}
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        // 助手消息布局：模仿suna项目
        <>
          {/* 头像和名字 */}
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 flex-shrink-0 border border-primary/10 shadow-sm">
              <AvatarFallback className="bg-primary text-primary-foreground font-black text-xs">AI</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">PPT Agent</span>
              <span className="text-[10px] text-muted-foreground/60 font-medium">
                {formatDate(message.created_at)}
              </span>
            </div>
          </div>

          {/* 消息内容区 */}
          <div className="flex max-w-[90%] break-words overflow-hidden ml-11">
            <div className="space-y-1.5 min-w-0 flex-1 leading-relaxed text-[15px] transition-all">
              {/* 文本消息内容 */}
              {(cleanContent || (isStreaming && !isUser)) && (
                <div className="whitespace-pre-wrap break-words font-medium">
                  {cleanContent}
                </div>
              )}

              {/* 流式输出时的加载状态 */}
              {isStreaming && !isUser && !cleanContent && (
                <div className="flex items-center gap-1.5 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}

              {/* 交互卡片展示区 */}
              {message.interaction_card && (
                <InteractionCard card={message.interaction_card} />
              )}

              {/* 工具调用按钮 - 显示在操作按钮之前 */}
              {(!isUser && (isStreaming ? (currentToolCalls && currentToolCalls.length > 0) : (toolCalls.length > 0))) && (
                <div className="flex flex-col gap-2 mt-3">
                  {isStreaming && currentToolCalls?.map((tc) => (
                    <ToolCallButton
                      key={tc.index}
                      index={tc.index}
                      name={tc.name}
                      status={tc.status}
                      onClick={() => handleToolClick(tc.index)}
                    />
                  ))}
                  {!isStreaming && toolCalls.map((toolCall) => (
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

              {/* 操作按钮栏 */}
              <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
          </div>
        </>
      )}
    </motion.div>
  );
}

