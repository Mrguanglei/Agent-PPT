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
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        {children}
      </main>
      <ToolSidePanel />
    </div>
  );
}
