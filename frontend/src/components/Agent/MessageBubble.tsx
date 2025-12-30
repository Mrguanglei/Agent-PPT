import React from 'react';
import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface MessageBubbleProps {
  message: {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  };
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* 头像 */}
      <div className={`
        w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
        ${isUser
          ? 'bg-gradient-to-br from-green-400 to-blue-500'
          : 'bg-gradient-to-br from-blue-500 to-purple-600'
        }
      `}>
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-white" />
        )}
      </div>

      {/* 消息内容 */}
      <div className={`flex-1 max-w-3xl ${isUser ? 'flex justify-end' : ''}`}>
        <div className={`
          rounded-2xl px-4 py-3
          ${isUser
            ? 'bg-blue-600 text-white'
            : 'bg-white border border-gray-200 text-gray-900'
          }
        `}>
          <ReactMarkdown
            className="prose prose-sm max-w-none"
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              code: ({ children }) => (
                <code className={`px-1 py-0.5 rounded ${isUser ? 'bg-blue-700' : 'bg-gray-100'}`}>
                  {children}
                </code>
              )
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {/* 时间戳 */}
        <div className={`text-xs text-gray-400 mt-1 px-1 ${isUser ? 'text-right' : ''}`}>
          {new Date(message.timestamp).toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
