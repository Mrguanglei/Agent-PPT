import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  FolderOpen,
  Plus,
  Settings,
  LogOut
} from 'lucide-react';
import { useAuthStore, useProjectStore } from '@/store';
import { useState } from 'react';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { projects, createProject } = useProjectStore();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateProject = async () => {
    try {
      await createProject({
        title: '新项目',
        description: '项目描述'
      });
      setShowCreateModal(false);
    } catch (error) {
      // Error handled by store
    }
  };

  const menuItems = [
    { icon: Home, label: '首页', path: '/' },
    { icon: FolderOpen, label: '项目', path: '/projects' },
  ];

  return (
    <motion.div
      className="w-64 bg-white border-r border-gray-200 flex flex-col"
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">PPT Agent</h1>
        <p className="text-sm text-gray-600 mt-1">AI 智能PPT生成</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                isActive
                  ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}

        {/* Projects Section */}
        <div className="pt-6">
          <div className="flex items-center justify-between px-4 mb-3">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              项目
            </h3>
            <button
              onClick={() => setShowCreateModal(true)}
              className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1">
            {projects.slice(0, 8).map((project) => (
              <Link
                key={project.id}
                to={`/project/${project.id}`}
                className={`block px-4 py-2 mx-2 rounded-lg text-sm transition-colors ${
                  location.pathname === `/project/${project.id}`
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="truncate">{project.title}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {project.slides_count || 0} 张幻灯片
                </div>
              </Link>
            ))}

            {projects.length > 8 && (
              <div className="px-4 py-2 mx-2 text-xs text-gray-400">
                还有 {projects.length - 8} 个项目...
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">
              {user?.username}
            </div>
            <div className="text-xs text-gray-500">
              {user?.email}
            </div>
          </div>
          <button
            onClick={logout}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
            title="退出登录"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            className="bg-white rounded-lg p-6 w-96 mx-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h3 className="text-lg font-semibold mb-4">创建新项目</h3>
            <p className="text-gray-600 mb-6">
              系统将创建一个新项目，您可以立即开始与AI对话来生成PPT内容。
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCreateProject}
                className="btn btn-primary flex-1"
              >
                创建项目
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn btn-secondary flex-1"
              >
                取消
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Sidebar;
