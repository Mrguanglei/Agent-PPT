import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAgentStore } from '@/store';
import MessageBubble from './MessageBubble';
import ToolCallIndicator from './ToolCallIndicator';
import InputBar from './InputBar';
import SlideGrid from '@/components/Slides/SlideGrid';

interface ChatInterfaceProps {
  projectId?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ projectId }) => {
  const { messages, sendMessage, isProcessing, currentToolCall } = useAgentStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentToolCall]);

  const handleSendMessage = async (message: string) => {
    await sendMessage(message, projectId);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <MessageBubble message={message} />

              {/* Show slides if message contains them */}
              {message.slides && message.slides.length > 0 && (
                <motion.div
                  className="mt-6"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <SlideGrid slides={message.slides} />
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Tool Call Indicator */}
        <AnimatePresence>
          {currentToolCall && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ToolCallIndicator toolCall={currentToolCall} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Welcome message for empty chat */}
        {messages.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                开始创建你的PPT
              </h3>
              <p className="text-gray-600">
                告诉我你想要创建什么样的演示文稿，我会帮你生成专业的幻灯片内容。
              </p>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="border-t border-gray-200 p-6">
        <InputBar
          onSend={handleSendMessage}
          disabled={isProcessing}
          placeholder="告诉我你想要创建什么样的PPT..."
        />
      </div>
    </div>
  );
};

export default ChatInterface;
