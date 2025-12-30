import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { ChatWorkspace } from '../Chat/ChatWorkspace';
import { DetailPanel } from '../DetailPanel/DetailPanel';

const AppLayout: React.FC = () => {
  return (
    <div className="h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <Header />

      {/* 主体内容区 */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* 左侧边栏 - 对话列表 */}
        <Sidebar />

        {/* 中间主对话区 */}
        <ChatWorkspace />

        {/* 右侧详情面板 */}
        <DetailPanel />
      </div>
    </div>
  );
};

export default AppLayout;
