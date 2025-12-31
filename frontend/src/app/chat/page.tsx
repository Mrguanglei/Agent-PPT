'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useChats } from '@/hooks/useChats';
import { Loader2 } from 'lucide-react';

export default function ChatPage() {
  const router = useRouter();
  const { chats, isLoading, createChat } = useChats();
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    // 如果还在加载中，等待
    if (isLoading) return;

    // 如果有聊天，重定向到最新的聊天
    if (chats.length > 0) {
      const latestChat = chats[0]; // chats 已经按 updated_at desc 排序
      router.replace(`/chat/${latestChat.id}`);
      return;
    }

    // 如果没有聊天，创建一个新的
    const createNewChat = async () => {
      try {
        setIsCreating(true);
        const newChat = await createChat();
        router.replace(`/chat/${newChat.id}`);
      } catch (error) {
        console.error('Failed to create chat:', error);
        // 即使创建失败，也重定向到一个临时ID，让用户可以开始对话
        router.replace(`/chat/temp`);
      } finally {
        setIsCreating(false);
      }
    };

    createNewChat();
  }, [chats, isLoading, router, createChat]);

  // 显示加载状态
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">
          {isCreating ? '正在创建新对话...' : '正在加载...'}
        </p>
      </div>
    </div>
  );
}
