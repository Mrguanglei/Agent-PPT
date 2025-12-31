'use client';

import { useParams } from 'next/navigation';
import { ChatContainer } from '@/components/chat/ChatContainer';

export default function ChatPage() {
  const params = useParams();
  const chatId = params.id as string | undefined;

  return <ChatContainer chatId={chatId} />;
}
