'use client';

import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { ToolSidePanel } from '@/components/tool-panel/ToolSidePanel';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gradient-modern">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 relative">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
        <div className="relative z-10 flex-1 flex flex-col">
          {children}
        </div>
      </main>
      <ToolSidePanel />
    </div>
  );
}
