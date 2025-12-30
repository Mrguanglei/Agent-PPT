import React from 'react';
import { motion } from 'framer-motion';
import { User, Bot } from 'lucide-react';
import type { Message } from '@/types';
import clsx from 'clsx';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.type === 'user';

  return (
    <motion.div
      className={clsx(
        'flex gap-4 max-w-4xl',
        isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
      )}
      initial={{ opacity: 0, x: isUser ? 20 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Avatar */}
      <div className={clsx(
        'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
        isUser ? 'bg-primary-600' : 'bg-success-600'
      )}>
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={clsx(
        'rounded-lg px-4 py-3 max-w-2xl break-words',
        isUser
          ? 'bg-primary-600 text-white'
          : 'bg-gray-100 text-gray-900'
      )}>
        {/* Message Text */}
        <div className="whitespace-pre-wrap">{message.content}</div>

        {/* Timestamp */}
        <div className={clsx(
          'text-xs mt-2',
          isUser ? 'text-primary-100' : 'text-gray-500'
        )}>
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;
