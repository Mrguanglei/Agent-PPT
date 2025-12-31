'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquarePlus, History, Sparkles, User, Settings, Search, Plus, Trash2, MoreHorizontal, PanelLeftOpen, PanelLeftClose, LayoutGrid, Database } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

import { Chat } from '@/types/chat';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface SidebarProps {
  chats?: Chat[];
  onNewChat?: () => void;
  onDeleteChat?: (chatId: string) => void;
  user?: User | null;
  onSettingsClick?: () => void;
}

export function Sidebar({ chats = [], onNewChat, onDeleteChat, user, onSettingsClick }: SidebarProps) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsed, setCollapsed] = useState(false);

  const filteredChats = chats.filter(chat =>
    chat.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <TooltipProvider>
      <div className={cn(
        collapsed ? 'w-[68px]' : 'w-72',
        'flex flex-col h-full bg-card border-r border-border transition-all duration-300 ease-in-out z-30'
      )}>
        {/* Header Section */}
        <div className="p-4 flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2.5 px-1">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="font-bold text-lg tracking-tight">PPT Agent</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className={cn("h-8 w-8 text-muted-foreground hover:text-foreground", collapsed && "mx-auto")}
          >
            {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="px-3 py-2 space-y-1">
          <Button
            onClick={onNewChat}
            className={cn(
              "w-full justify-start gap-3 h-11 rounded-xl shadow-sm transition-all",
              collapsed ? "px-0 justify-center" : "px-4"
            )}
          >
            <Plus className="h-5 w-5" />
            {!collapsed && <span className="font-bold">新建对话</span>}
          </Button>
          
          {!collapsed && (
            <div className="relative mt-4 px-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索历史..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 bg-muted/50 border-none rounded-xl focus-visible:ring-1 focus-visible:ring-primary/20"
              />
            </div>
          )}
        </div>

        {/* Navigation / History */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-none">
          {/* Main Nav */}
          <div className="space-y-1">
            {[
              { icon: LayoutGrid, label: '智能体中心', active: false },
              { icon: Database, label: '云知识库', active: false },
            ].map((item, i) => (
              <Button
                key={i}
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 h-10 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  collapsed ? "px-0 justify-center" : "px-3"
                )}
              >
                <item.icon className="h-5 w-5" />
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              </Button>
            ))}
          </div>

          {/* History List */}
          <div className="space-y-2">
            {!collapsed && (
              <div className="px-3 flex items-center justify-between text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                <span>最近对话</span>
                <Badge variant="secondary" className="h-4 px-1.5 text-[10px] bg-muted/50">{filteredChats.length}</Badge>
              </div>
            )}
            
            <div className="space-y-1">
              {filteredChats.map((chat) => (
                <Link
                  key={chat.id}
                  href={`/chat/${chat.id}`}
                  className={cn(
                    "group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all",
                    pathname === `/chat/${chat.id}` 
                      ? "bg-primary/5 text-primary" 
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                    collapsed && "justify-center px-0"
                  )}
                >
                  <MessageSquarePlus className={cn("h-5 w-5 flex-shrink-0", pathname === `/chat/${chat.id}` ? "text-primary" : "text-muted-foreground/60")} />
                  {!collapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{chat.title ?? '未命名对话'}</p>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* User Section */}
        <div className="p-4 border-t border-border">
          <div className={cn(
            "flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer",
            collapsed && "justify-center p-0"
          )}>
            <Avatar className="h-9 w-9 border border-border/50">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{user?.name || '未登录用户'}</p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {user?.email || (
                    <Link href="/login" className="hover:text-primary transition-colors">
                      点击登录账号
                    </Link>
                  )}
                </p>
              </div>
            )}
            {!collapsed && <Settings className="h-4 w-4 text-muted-foreground" />}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
