import React from 'react';
import { MessageBubble } from '../Agent/MessageBubble';

interface MessageListProps {
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  return (
    <div className="space-y-6">
      {messages.map((message, index) => (
        <MessageBubble key={message.id || index} message={message} />
      ))}
    </div>
  );
};
