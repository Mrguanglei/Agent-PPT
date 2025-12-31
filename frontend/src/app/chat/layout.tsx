'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { ToolSidePanel } from '@/components/tool-panel/ToolSidePanel';
import { useToolPanelStore } from '@/stores/toolPanelStore';
import { motion } from 'framer-motion';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOpen: isToolPanelOpen } = useToolPanelStore();

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <motion.main
        className="flex-1 flex flex-col min-w-0"
        animate={{
          marginRight: isToolPanelOpen ? 384 : 0, // 96 * 4 = 384px (w-96)
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30
        }}
      >
        <div className="flex-1 flex flex-col">
          {children}
        </div>
      </motion.main>

      {/* Tool Panel */}
      <ToolSidePanel />
    </div>
  );
}
