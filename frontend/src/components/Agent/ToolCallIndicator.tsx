import React from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Image,
  FileText,
  Layout,
  Edit,
  Trash,
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react';
import type { ToolCallState } from '@/types';

interface ToolCallIndicatorProps {
  toolCall: ToolCallState;
}

const TOOL_ICONS = {
  search_images: Image,
  web_search: Search,
  visit_page: FileText,
  initialize_design: Layout,
  insert_page: Layout,
  update_page: Edit,
  remove_pages: Trash,
  think: CheckCircle,
};

const TOOL_LABELS = {
  search_images: '搜索图片素材',
  web_search: '搜索网页信息',
  visit_page: '访问网页内容',
  initialize_design: '初始化PPT设计',
  insert_page: '插入新幻灯片',
  update_page: '更新幻灯片内容',
  remove_pages: '删除幻灯片',
  think: '规划PPT制作流程',
};

const STATUS_CONFIG = {
  starting: {
    icon: Loader,
    text: '正在启动...',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  processing: {
    icon: Loader,
    text: '处理中...',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  completed: {
    icon: CheckCircle,
    text: '已完成',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  failed: {
    icon: AlertCircle,
    text: '执行失败',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
};

const ToolCallIndicator: React.FC<ToolCallIndicatorProps> = ({ toolCall }) => {
  const Icon = TOOL_ICONS[toolCall.tool] || Layout;
  const label = TOOL_LABELS[toolCall.tool] || toolCall.tool;
  const status = STATUS_CONFIG[toolCall.status];

  const StatusIcon = status.icon;

  return (
    <motion.div
      className={`flex items-center gap-4 px-4 py-3 ${status.bgColor} border ${status.borderColor} rounded-lg max-w-2xl`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Tool Icon */}
      <div className="relative flex-shrink-0">
        <div className={`w-10 h-10 ${status.bgColor} rounded-full flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${status.color}`} />
        </div>

        {/* Loading Animation */}
        {toolCall.status === 'processing' && (
          <motion.div
            className="absolute inset-0 border-2 border-current rounded-full"
            style={{ borderColor: `${status.color} transparent transparent transparent` }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium ${status.color} truncate`}>
          {label}
        </div>

        <div className={`text-xs ${status.color} mt-1 flex items-center gap-2`}>
          <StatusIcon className="w-3 h-3" />
          <span>{status.text}</span>
        </div>

        {/* Result Preview */}
        {toolCall.result && (
          <div className="text-xs text-gray-600 mt-2 max-w-md">
            {typeof toolCall.result === 'object'
              ? JSON.stringify(toolCall.result).substring(0, 100) + '...'
              : String(toolCall.result).substring(0, 100) + '...'
            }
          </div>
        )}

        {/* Error Message */}
        {toolCall.error && (
          <div className="text-xs text-red-600 mt-2">
            {toolCall.error}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ToolCallIndicator;
