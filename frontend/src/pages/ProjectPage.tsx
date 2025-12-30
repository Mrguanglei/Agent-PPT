import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProjectStore, useSlideStore, useAgentStore } from '@/store';
import { ChatInterface } from '@/components/Agent';
import { SlideGrid } from '@/components/Slides';
import { Button, LoadingSpinner, Modal } from '@/components/Common';
import {
  ArrowLeft,
  MessageSquare,
  Grid,
  Settings,
  Download,
  Share
} from 'lucide-react';
import toast from 'react-hot-toast';

type ViewMode = 'chat' | 'slides';

const ProjectPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('chat');
  const [showSettings, setShowSettings] = useState(false);

  const {
    currentProject,
    loading: projectLoading,
    fetchProjects,
    updateProject,
    deleteProject,
  } = useProjectStore();

  const {
    slides,
    loading: slidesLoading,
    fetchSlides,
  } = useSlideStore();

  const { messages } = useAgentStore();

  useEffect(() => {
    if (projectId) {
      fetchSlides(projectId);
    }
  }, [projectId, fetchSlides]);

  useEffect(() => {
    if (!currentProject && projectId) {
      // If no current project but have projectId, fetch projects
      fetchProjects().then(() => {
        const project = useProjectStore.getState().projects.find(p => p.id === projectId);
        if (project) {
          useProjectStore.getState().setCurrentProject(project);
        } else {
          navigate('/');
        }
      });
    }
  }, [projectId, currentProject, fetchProjects, navigate]);

  const handleBack = () => {
    navigate('/');
  };

  const handleDeleteProject = async () => {
    if (!currentProject) return;

    if (window.confirm('确定要删除这个项目吗？此操作无法撤销。')) {
      try {
        await deleteProject(currentProject.id);
        toast.success('项目删除成功');
        navigate('/');
      } catch (error) {
        // Error handled by store
      }
    }
  };

  const handleExport = () => {
    toast.success('导出功能即将上线');
  };

  const handleShare = () => {
    toast.success('分享功能即将上线');
  };

  if (projectLoading || !currentProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <motion.div
      className="h-full flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>

            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {currentProject.title}
              </h1>
              {currentProject.description && (
                <p className="text-sm text-gray-600 mt-1">
                  {currentProject.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('chat')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'chat'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <MessageSquare className="w-4 h-4 inline mr-2" />
                对话
              </button>
              <button
                onClick={() => setViewMode('slides')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'slides'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid className="w-4 h-4 inline mr-2" />
                幻灯片
              </button>
            </div>

            {/* Action Buttons */}
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share className="w-4 h-4 mr-2" />
              分享
            </Button>

            <Button variant="ghost" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              导出
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Project Stats */}
        <div className="flex items-center gap-6 mt-4 text-sm text-gray-600">
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

          <span>{slides.length} 张幻灯片</span>
          <span>{messages.length} 条消息</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'chat' ? (
          <div className="h-full p-6">
            <ChatInterface projectId={currentProject.id} />
          </div>
        ) : (
          <div className="h-full p-6">
            {slidesLoading ? (
              <div className="flex items-center justify-center h-full">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <SlideGrid slides={slides} />
            )}
          </div>
        )}
      </div>

      {/* Settings Modal */}
      <Modal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="项目设置"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              项目标题
            </label>
            <input
              type="text"
              value={currentProject.title}
              onChange={(e) => {
                // Update local state
                useProjectStore.getState().setCurrentProject({
                  ...currentProject,
                  title: e.target.value,
                });
              }}
              className="input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              项目描述
            </label>
            <textarea
              value={currentProject.description || ''}
              onChange={(e) => {
                useProjectStore.getState().setCurrentProject({
                  ...currentProject,
                  description: e.target.value,
                });
              }}
              rows={3}
              className="input w-full"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              onClick={async () => {
                await updateProject(currentProject.id, {
                  title: currentProject.title,
                  description: currentProject.description,
                });
                setShowSettings(false);
              }}
              className="flex-1"
            >
              保存更改
            </Button>

            <Button
              variant="danger"
              onClick={handleDeleteProject}
              className="flex-1"
            >
              删除项目
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default ProjectPage;
