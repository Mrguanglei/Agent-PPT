import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useProjectStore, useAgentStore } from '@/store';
import { ChatInterface } from '@/components/Agent';
import { SlideGrid } from '@/components/Slides';
import { Button, LoadingSpinner } from '@/components/Common';
import { Plus, MessageSquare, FileText } from 'lucide-react';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentProject,
    projects,
    loading,
    fetchProjects,
    setCurrentProject
  } = useProjectStore();

  const { messages, clearMessages } = useAgentStore();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleProjectSelect = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setCurrentProject(project);
      clearMessages();
      navigate(`/project/${projectId}`);
    }
  };

  const handleCreateProject = () => {
    // This will be handled by the sidebar
    console.log('Create project');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Left Panel - Recent Projects */}
      <motion.div
        className="w-80 border-r border-gray-200 p-6"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            欢迎使用 PPT Agent
          </h2>
          <p className="text-gray-600 text-sm">
            选择一个项目开始，或创建一个新的项目
          </p>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3 mb-6">
          <Button
            onClick={handleCreateProject}
            className="w-full justify-start"
            variant="primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            创建新项目
          </Button>
        </div>

        {/* Recent Projects */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            最近项目
          </h3>
          {projects.length > 0 ? (
            <div className="space-y-2">
              {projects.slice(0, 5).map((project) => (
                <motion.div
                  key={project.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    currentProject?.id === project.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleProjectSelect(project.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">
                        {project.title}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {project.description || '暂无描述'}
                      </p>
                      <div className="flex items-center mt-2 text-xs text-gray-400">
                        <FileText className="w-3 h-3 mr-1" />
                        {project.slides_count || 0} 张幻灯片
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <FileText className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">暂无项目</p>
              <p className="text-xs mt-1">点击上方创建你的第一个项目</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Right Panel - Chat Interface */}
      <motion.div
        className="flex-1 p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="h-full">
          {currentProject ? (
            <div className="h-full flex flex-col">
              {/* Project Header */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  {currentProject.title}
                </h1>
                {currentProject.description && (
                  <p className="text-gray-600 mt-2">
                    {currentProject.description}
                  </p>
                )}
                <div className="flex items-center mt-3 text-sm text-gray-500">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    currentProject.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : currentProject.status === 'generating'
                      ? 'bg-blue-100 text-blue-800'
                      : currentProject.status === 'failed'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {currentProject.status === 'draft' && '草稿'}
                    {currentProject.status === 'generating' && '生成中'}
                    {currentProject.status === 'completed' && '已完成'}
                    {currentProject.status === 'failed' && '生成失败'}
                  </span>
                  <span className="ml-4">
                    {currentProject.slides_count || 0} 张幻灯片
                  </span>
                </div>
              </div>

              {/* Chat Interface */}
              <div className="flex-1">
                <ChatInterface projectId={currentProject.id} />
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <motion.div
                className="text-center max-w-md"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="w-10 h-10 text-primary-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  开始你的PPT创作之旅
                </h2>
                <p className="text-gray-600 mb-8">
                  选择左侧的项目，或创建一个新的项目来开始与AI对话生成专业幻灯片。
                </p>
                <Button onClick={handleCreateProject} size="lg">
                  <Plus className="w-5 h-5 mr-2" />
                  创建新项目
                </Button>
              </motion.div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default HomePage;
