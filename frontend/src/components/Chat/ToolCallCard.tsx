import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Image,
  FileText,
  Layout,
  CheckCircle,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { useDetailPanel } from '@/hooks/useDetailPanel';

const TOOL_CONFIG = {
  search_images: {
    icon: Image,
    label: '搜索图片',
    color: 'blue',
    description: '正在搜索相关图片素材...'
  },
  web_search: {
    icon: Search,
    label: '网页搜索',
    color: 'green',
    description: '正在搜索相关信息...'
  },
  visit_page: {
    icon: FileText,
    label: '访问页面',
    color: 'purple',
    description: '正在获取页面内容...'
  },
  initialize_design: {
    icon: Layout,
    label: '初始化设计',
    color: 'orange',
    description: '正在初始化PPT设计...'
  },
  insert_page: {
    icon: Layout,
    label: '插入页面',
    color: 'pink',
    description: '正在生成幻灯片页面...'
  }
};

interface ToolCallCardProps {
  toolCall: {
    id: string;
    tool: string;
    status: 'running' | 'completed' | 'failed';
    params?: any;
    result?: any;
    duration?: number;
  };
}

export const ToolCallCard: React.FC<ToolCallCardProps> = ({ toolCall }) => {
  const { openPanel } = useDetailPanel();
  const config = TOOL_CONFIG[toolCall.tool] || TOOL_CONFIG.web_search;
  const Icon = config.icon;

  const handleOpenDetail = () => {
    openPanel({
      tool: toolCall.tool,
      params: toolCall.params,
      result: toolCall.result,
      duration: toolCall.duration
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* 工具图标 */}
          <div className={`
            w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
            bg-${config.color}-50
          `}>
            <Icon className={`w-5 h-5 text-${config.color}-600`} />
          </div>

          {/* 内容区域 */}
          <div className="flex-1 min-w-0">
            {/* 标题行 */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-gray-900">
                  {config.label}
                </h4>
                {toolCall.status === 'running' && (
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                )}
                {toolCall.status === 'completed' && (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                )}
              </div>

              {/* 耗时显示 */}
              {toolCall.duration && (
                <span className="text-xs text-gray-400">
                  {toolCall.duration.toFixed(2)}s
                </span>
              )}
            </div>

            {/* 描述 */}
            <p className="text-sm text-gray-600 mb-3">
              {config.description}
            </p>

            {/* 参数预览 */}
            {toolCall.params && (
              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <div className="text-xs font-medium text-gray-500 mb-1">
                  参数
                </div>
                <div className="text-sm text-gray-700 font-mono">
                  {JSON.stringify(toolCall.params, null, 2).substring(0, 100)}
                  {JSON.stringify(toolCall.params).length > 100 && '...'}
                </div>
              </div>
            )}

            {/* 结果简要预览 */}
            {toolCall.status === 'completed' && toolCall.result && (
              <div className="bg-green-50 rounded-lg p-3 mb-3">
                <div className="text-xs font-medium text-green-700 mb-1">
                  ✓ 执行成功
                </div>
                {toolCall.tool === 'search_images' && toolCall.result.images && (
                  <div className="text-sm text-green-700">
                    找到 {toolCall.result.images.length} 张图片
                  </div>
                )}
                {toolCall.tool === 'insert_page' && (
                  <div className="text-sm text-green-700">
                    已插入第 {(toolCall.params?.index || 0) + 1} 页
                  </div>
                )}
              </div>
            )}

            {/* 查看详情按钮 */}
            <button
              onClick={handleOpenDetail}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium group"
            >
              <span>查看详细信息</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* 进度条 */}
      {toolCall.status === 'running' && (
        <div className="h-1 bg-gray-100">
          <motion.div
            className={`h-full bg-${config.color}-500`}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 2, ease: 'easeInOut' }}
          />
        </div>
      )}
    </motion.div>
  );
};
