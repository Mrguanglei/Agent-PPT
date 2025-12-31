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
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <motion.main
        className="flex-1 flex flex-col min-w-0"
        animate={{
          marginRight: isToolPanelOpen ? 896 : 0, // 56rem = 896px (matches ToolSidePanel width)
        }}
        transition={{
          type: 'spring',
          stiffness: 280,
          damping: 35,
          mass: 0.8
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
