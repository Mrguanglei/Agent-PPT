'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChatContainer } from '@/components/chat/ChatContainer';
import { Loader2 } from 'lucide-react';

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = params.id as string | undefined;

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      // Redirect to login page and save current URL for redirect after login
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [router]);

  // Check token immediately for SSR
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (!token) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm font-medium text-muted-foreground">正在验证身份...</p>
          </div>
        </div>
      );
    }
  }

  return <ChatContainer chatId={chatId} />;
}
