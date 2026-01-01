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

      {/* Streaming assistant message - only text content */}
      {isStreaming && streamingContent && (
        <div className="flex gap-3 animate-in">
          <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-primary-foreground text-xs font-bold">AI</span>
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-foreground">PPT Agent</p>
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            </div>

            <div className="bg-muted text-foreground max-w-[80%] rounded-2xl px-4 py-3 shadow-sm">
              <p className="whitespace-pre-wrap leading-relaxed">
                {streamingContent}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tool calls in real-time - separate block */}
      {currentToolCalls.length > 0 && (
        <div className="flex gap-3 animate-in">
          <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-primary-foreground text-xs font-bold">AI</span>
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-foreground">PPT Agent</p>
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            </div>

            <div className="space-y-2 max-w-[80%]">
              <div className="flex flex-col gap-2">
                {currentToolCalls.map((toolCall) => {
                  // Get tool icon and display name
                  const toolIcons: Record<string, string> = {
                    web_search: '🔍',
                    search_images: '🖼️',
                    visit_page: '🌐',
                    initialize_slide: '📊',
                    insert_slides: '📄',
                    html: '🎨',
                    update_slide: '✏️',
                    think: '💭'
                  };

                  const toolNames: Record<string, string> = {
                    web_search: '搜索',
                    search_images: '图片搜索',
                    visit_page: '浏览网页',
                    initialize_slide: '初始化幻灯片',
                    insert_slides: '插入幻灯片',
                    html: '生成内容',
                    update_slide: '更新幻灯片',
                    think: '思考'
                  };

                  // Extract primary parameter for display
                  const getPrimaryParam = (toolName: string, params: any) => {
                    if (!params) return '';

                    switch (toolName) {
                      case 'web_search':
                        return params.queries?.[0] || '搜索查询';
                      case 'search_images':
                        return params.query || '图片查询';
                      case 'visit_page':
                        return params.url || '网页地址';
                      case 'initialize_slide':
                        return params.title || '幻灯片标题';
                      case 'insert_slides':
                      case 'html':
                      case 'update_slide':
                        return `第${params.index}页`;
                      case 'think':
                        return params.thought?.substring(0, 50) + '...' || '思考内容';
                      default:
                        return '';
                    }
                  };

                  const primaryParam = getPrimaryParam(toolCall.name, toolCall.params);

                  return (
                    <div key={toolCall.index} className="flex items-center gap-2 text-sm">
                      <span className="text-base">{toolIcons[toolCall.name] || '🔧'}</span>
                      <span className="font-medium">{toolNames[toolCall.name] || toolCall.name}</span>
                      {primaryParam && (
                        <>
                          <span className="text-muted-foreground">:</span>
                          <span className="text-muted-foreground truncate max-w-[200px]">{primaryParam}</span>
                        </>
                      )}
                      <div className="flex items-center gap-1 ml-auto">
                        {toolCall.status === 'running' && (
                          <>
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            <span className="text-xs text-blue-600">执行中</span>
                          </>
                        )}
                        {toolCall.status === 'success' && (
                          <>
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <span className="text-xs text-green-600">完成</span>
                          </>
                        )}
                        {toolCall.status === 'failed' && (
                          <>
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                            <span className="text-xs text-red-600">失败</span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
