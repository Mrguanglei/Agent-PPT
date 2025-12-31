'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { ToolSidePanel } from '@/components/tool-panel/ToolSidePanel';
import { useToolPanelStore } from '@/stores/toolPanelStore';
import { useAuth } from '@/hooks/useAuth';
import { useChats } from '@/hooks/useChats';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOpen: isToolPanelOpen } = useToolPanelStore();
  const { user, logout } = useAuth();
  const { chats, deleteChat, createChat } = useChats();
  const router = useRouter();

  const handleNewChat = async () => {
    try {
      const newChat = await createChat();
      router.push(`/chat/${newChat.id}`);
    } catch (error) {
      console.error('Failed to create new chat:', error);
      // 如果未登录，跳转到登录页
      if (!localStorage.getItem('token')) {
        router.push('/login');
      }
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar - 固定在左侧 */}
      <Sidebar 
        user={user} 
        chats={chats} 
        onNewChat={handleNewChat}
        onDeleteChat={deleteChat}
        onSettingsClick={() => console.log('Settings clicked')}
      />

      {/* Main Content - 只有这里滚动 */}
      <motion.main
        className="flex-1 flex flex-col min-w-0 relative"
        animate={{
          marginRight: isToolPanelOpen ? 896 : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 280,
          damping: 35,
          mass: 0.8
        }}
      >
        {children}
      </motion.main>

      {/* Tool Panel - 固定在右侧 */}
      <ToolSidePanel />
    </div>
  );
}
