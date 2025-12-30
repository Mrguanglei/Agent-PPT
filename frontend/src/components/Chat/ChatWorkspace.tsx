import React, { useRef, useEffect } from 'react';
import { MessageList } from './MessageList';
import { WelcomePrompt } from './WelcomePrompt';
import InputBar from '../Agent/InputBar';
import { ToolCallCard } from './ToolCallCard';
import { SlidePreviewGrid } from './SlidePreviewGrid';
import { useAgentStore } from '@/store/agentStore';
import { useConversationStore } from '@/store/conversationStore';

export const ChatWorkspace: React.FC = () => {
  const { currentId, conversations, switchConversation, fetchConversations } = useConversationStore();

  // 初始化时获取对话列表
  React.useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // 如果没有当前对话，选择第一个现有对话
  React.useEffect(() => {
    if (!currentId && conversations.length > 0) {
      console.log('Selecting existing conversation:', conversations[0].id);
      switchConversation(conversations[0].id);
    }
  }, [currentId, conversations, switchConversation]);

  const { messages, sendMessage, isProcessing, currentToolCall } = useAgentStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* 消息滚动区域 */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto py-6 px-6 space-y-6">
          {/* 欢迎提示 */}
          {messages.length === 0 && (
            <WelcomePrompt onSend={sendMessage} />
          )}

          {/* 消息列表 */}
          <MessageList messages={messages} />

          {/* 当前工具调用卡片 */}
          {currentToolCall && (
            <ToolCallCard toolCall={{
              id: 'current',
              tool: currentToolCall.tool,
              status: currentToolCall.status as any,
              params: currentToolCall,
              result: currentToolCall.result
            }} />
          )}

          {/* 幻灯片预览网格 - 暂时隐藏，因为新架构中幻灯片数据通过消息传递 */}
          {/* {slides.length > 0 && (
            <SlidePreviewGrid slides={slides} />
          )} */}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 输入栏 */}
      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto p-4">
          <InputBar
            onSend={sendMessage}
            disabled={isProcessing}
            placeholder="告诉我你想要创建什么样的PPT..."
          />
        </div>
      </div>
    </div>
  );
};
