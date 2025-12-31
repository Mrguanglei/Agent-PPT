'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquarePlus, History, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Chat {
  id: string;
  title: string;
  updated_at: string;
}

interface SidebarProps {
  chats?: Chat[];
  onNewChat?: () => void;
}

export function Sidebar({ chats = [], onNewChat }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="w-80 sidebar flex flex-col h-full shadow-modern border-r border-sidebar-border">
      {/* Header */}
      <div className="sidebar-header">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-semibold text-sidebar-foreground text-lg">PPT Agent</h1>
            <p className="text-xs text-sidebar-foreground/60">AI 驱动的演示文稿创建工具</p>
          </div>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="sidebar-content border-b border-sidebar-border pb-4">
        <Button
          onClick={onNewChat}
          className="w-full btn-modern-primary justify-start gap-3 h-11"
        >
          <MessageSquarePlus className="h-4 w-4" />
          <span className="font-medium">新建对话</span>
        </Button>
      </div>

      {/* Chat History */}
      <div className="sidebar-content flex-1">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm text-sidebar-foreground/70">
            <History className="h-4 w-4" />
            <span className="font-medium">历史对话</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {chats.length}
          </Badge>
        </div>

        <div className="space-y-2 scrollbar-modern max-h-[calc(100vh-200px)] overflow-y-auto">
          {chats.map((chat) => (
            <Link
              key={chat.id}
              href={`/chat/${chat.id}`}
              className={`sidebar-item ${
                pathname === `/chat/${chat.id}` ? 'active' : ''
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="truncate font-medium">
                  {chat.title || '未命名对话'}
                </div>
                <div className="text-xs text-sidebar-foreground/60 mt-1">
                  {new Date(chat.updated_at).toLocaleDateString('zh-CN', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </Link>
          ))}

          {chats.length === 0 && (
            <div className="text-center py-12 px-4">
              <div className="p-3 rounded-lg bg-sidebar-accent/50 mx-auto w-fit mb-3">
                <History className="h-6 w-6 text-sidebar-foreground/40" />
              </div>
              <p className="text-sm text-sidebar-foreground/60">
                暂无历史对话
              </p>
              <p className="text-xs text-sidebar-foreground/40 mt-1">
                开始创建您的第一个对话
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
