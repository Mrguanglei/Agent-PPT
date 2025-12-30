import React from 'react';
import { Plus, MessageSquare, Settings, Trash2 } from 'lucide-react';
import { useConversationStore } from '@/store/conversationStore';

export const Sidebar: React.FC = () => {
  const { conversations, currentId, createConversation, switchConversation, deleteConversation, loading } = useConversationStore();

  return (
    <aside className="w-[280px] border-r border-gray-200 bg-white flex flex-col">
      {/* 新建对话按钮 */}
      <div className="p-4">
        <button
          onClick={() => createConversation()}
          disabled={loading}
          className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl transition-all"
        >
          <Plus className="w-5 h-5" />
          新建对话
        </button>
      </div>

      {/* 对话列表 */}
      <div className="flex-1 overflow-y-auto px-3 space-y-1">
        <div className="text-xs font-medium text-gray-400 px-3 py-2">
          最近对话
        </div>

        {conversations.map((conv) => (
          <ConversationItem
            key={conv.id}
            conversation={conv}
            isActive={conv.id === currentId}
            onClick={() => switchConversation(conv.id)}
            onDelete={() => deleteConversation(conv.id)}
          />
        ))}
      </div>

      {/* 底部设置 */}
      <div className="border-t border-gray-200 p-3">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 text-sm">
          <Settings className="w-4 h-4" />
          设置
        </button>
      </div>
    </aside>
  );
};

// 对话项组件
interface ConversationItemProps {
  conversation: {
    id: string;
    title: string;
    lastMessage: string;
    updatedAt: string;
  };
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isActive,
  onClick,
  onDelete
}) => {
  return (
    <div
      className={`
        group relative flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer
        transition-colors
        ${isActive
          ? 'bg-blue-50 border border-blue-200'
          : 'hover:bg-gray-50'
        }
      `}
      onClick={onClick}
    >
      {/* 图标 */}
      <div className={`
        w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
        ${isActive ? 'bg-blue-500' : 'bg-gray-200'}
      `}>
        <MessageSquare className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-600'}`} />
      </div>

      {/* 内容 */}
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium truncate ${isActive ? 'text-blue-700' : 'text-gray-900'}`}>
          {conversation.title || '新对话'}
        </div>
        <div className="text-xs text-gray-500 truncate">
          {conversation.lastMessage || '开始新的对话...'}
        </div>
      </div>

      {/* 删除按钮 */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition-opacity"
      >
        <Trash2 className="w-4 h-4 text-red-500" />
      </button>
    </div>
  );
};
