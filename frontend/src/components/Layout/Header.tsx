import React from 'react';
import { Sparkles } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export const Header: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <header className="h-16 border-b border-gray-200 bg-white px-6 flex items-center justify-between">
      {/* Logo区域 */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">PPT Agent</h1>
          <p className="text-xs text-gray-500">智能演示文稿生成器</p>
        </div>
      </div>

      {/* 右侧用户区域 */}
      <div className="flex items-center gap-4">
        <button className="text-sm text-gray-600 hover:text-gray-900">
          使用指南
        </button>

        {/* 用户菜单 */}
        <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-lg px-3 py-2">
          <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {user?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || '张'}
          </div>
          <span className="text-sm font-medium text-gray-700">
            {user?.username || '张三'}
          </span>
        </div>
      </div>
    </header>
  );
};
