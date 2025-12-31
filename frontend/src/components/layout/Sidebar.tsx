'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquarePlus, History, Sparkles, User, Settings, Search, Plus, Trash2, MoreHorizontal, PanelLeftOpen, PanelLeftClose } from 'lucide-react';
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

interface Chat {
  id: string;
  title: string;
  updated_at: string;
}

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
      collapsed ? 'w-14' : 'w-80',
      'sidebar flex h-full shadow-modern border-r border-sidebar-border transition-all duration-200'
    )}>
      {/* left rail + content */}
      <div className="flex h-full w-full">
        {/* slim rail */}
        <div className="w-14 flex flex-col items-center gap-4 py-4 bg-sidebar/90 border-r border-sidebar-border">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="p-2 rounded-lg hover:bg-sidebar-accent/30 transition-colors cursor-pointer"
                  onClick={() => setCollapsed((s) => !s)}
                  aria-label={collapsed ? '展开侧栏' : '收起侧栏'}
                >
                  {collapsed ? <PanelLeftOpen className="h-5 w-5 text-sidebar-foreground" /> : <PanelLeftClose className="h-5 w-5 text-sidebar-foreground" />}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {collapsed ? '展开侧栏' : '收起侧栏'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="p-2 rounded-lg hover:bg-sidebar-accent/30 transition-colors cursor-pointer" role="button" tabIndex={0}>
                <Sparkles className="h-5 w-5 text-sidebar-foreground" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">概览</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="p-2 rounded-lg hover:bg-sidebar-accent/30 transition-colors cursor-pointer" role="button" tabIndex={0}>
                <Plus className="h-5 w-5 text-sidebar-foreground" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">新建</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="p-2 rounded-lg hover:bg-sidebar-accent/30 transition-colors cursor-pointer" role="button" tabIndex={0}>
                <MessageSquarePlus className="h-5 w-5 text-sidebar-foreground" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">对话</TooltipContent>
          </Tooltip>
          <div className="flex-1" />
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="p-2 rounded-full hover:bg-sidebar-accent/30 transition-colors cursor-pointer" role="button" tabIndex={0}>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">U</AvatarFallback>
                </Avatar>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">账户</TooltipContent>
          </Tooltip>
        </div>

        {/* main content */}
        {!collapsed && (
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="sidebar-header p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h1 className="font-semibold text-sidebar-foreground text-lg">PPT Agent</h1>
                <p className="text-xs text-sidebar-foreground/60">AI 驱动的演示文稿创建工具</p>
              </div>
              {onSettingsClick && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onSettingsClick}
                  className="h-8 w-8 hover:bg-sidebar-accent"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* content scroll area */}
          <div className="sidebar-content p-3 border-t border-sidebar-border flex-1 flex flex-col">
            {user && (
              <div className="border-b border-sidebar-border pb-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-sidebar-accent/50">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="text-xs">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-sidebar-foreground truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-sidebar-foreground/60 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="border-b border-sidebar-border pb-4 mt-3">
              <Button
                onClick={onNewChat}
                className="w-full btn-modern-primary justify-start gap-3 h-11"
              >
                <Plus className="h-4 w-4" />
                <span className="font-medium">新建对话</span>
              </Button>

              <div className="mt-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-sidebar-foreground/40" />
                  <Input
                    placeholder="搜索对话..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 bg-sidebar-accent/50 border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/40"
                  />
                </div>
              </div>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-auto mt-3">
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2 text-sm text-sidebar-foreground/70">
                  <History className="h-4 w-4" />
                  <span className="font-medium">历史对话</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {filteredChats.length}
                </Badge>
              </div>

              <div className="space-y-2 scrollbar-modern max-h-[calc(100vh-320px)] overflow-y-auto px-1">
                {filteredChats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`sidebar-item group ${pathname === `/chat/${chat.id}` ? 'active' : ''}`}
                  >
                    <Link
                      href={`/chat/${chat.id}`}
                      className="flex-1 min-w-0"
                    >
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
                    </Link>

                    {onDeleteChat && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0"
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.preventDefault();
                              onDeleteChat(chat.id);
                            }}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            删除对话
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                ))}

                {filteredChats.length === 0 && searchQuery && (
                  <div className="text-center py-8 px-4">
                    <div className="p-3 rounded-lg bg-sidebar-accent/50 mx-auto w-fit mb-3">
                      <Search className="h-6 w-6 text-sidebar-foreground/40" />
                    </div>
                    <p className="text-sm text-sidebar-foreground/60">
                      未找到匹配的对话
                    </p>
                    <p className="text-xs text-sidebar-foreground/40 mt-1">
                      尝试其他搜索关键词
                    </p>
                  </div>
                )}

                {chats.length === 0 && !searchQuery && (
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
        </div>
        )}
      </div>
    </div>
    </TooltipProvider>
  );
}
