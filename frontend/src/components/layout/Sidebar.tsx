'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquarePlus, History } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    <div className="w-64 bg-muted/30 border-r border-border flex flex-col h-full">
      {/* New Chat Button */}
      <div className="p-4 border-b border-border">
        <Button
          onClick={onNewChat}
          className="w-full justify-start gap-2"
          variant="default"
        >
          <MessageSquarePlus className="h-4 w-4" />
          新建对话
        </Button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
          <History className="h-4 w-4" />
          <span className="font-medium">历史对话</span>
        </div>

        <div className="space-y-2">
          {chats.map((chat) => (
            <Link
              key={chat.id}
              href={`/chat/${chat.id}`}
              className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                pathname === `/chat/${chat.id}`
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="truncate">{chat.title}</div>
            </Link>
          ))}

          {chats.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-8">
              暂无历史对话
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
