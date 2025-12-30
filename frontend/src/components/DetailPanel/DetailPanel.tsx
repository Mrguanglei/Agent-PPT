import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image, Search, FileText, Layout, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useDetailPanel } from '@/hooks/useDetailPanel';

const TOOL_CONFIG = {
  search_images: {
    icon: Image,
    label: '图片搜索详情',
    color: 'blue'
  },
  web_search: {
    icon: Search,
    label: '网页搜索详情',
    color: 'green'
  },
  visit_page: {
    icon: FileText,
    label: '页面访问详情',
    color: 'purple'
  },
  initialize_design: {
    icon: Layout,
    label: '设计初始化详情',
    color: 'orange'
  },
  insert_page: {
    icon: Layout,
    label: '页面插入详情',
    color: 'pink'
  }
};

export const DetailPanel: React.FC = () => {
  const { isOpen, toolDetail, closePanel } = useDetailPanel();

  if (!toolDetail) return null;

  const config = TOOL_CONFIG[toolDetail.tool] || TOOL_CONFIG.web_search;
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePanel}
          />

          {/* 详情面板 */}
          <motion.div
            className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
          >
            {/* 头部 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 bg-${config.color}-50 rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 text-${config.color}-600`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {config.label}
                </h3>
              </div>

              <button
                onClick={closePanel}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 内容区域 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* 执行时间 */}
              {toolDetail.duration && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>执行时间: {toolDetail.duration.toFixed(2)}s</span>
                </div>
              )}

              {/* 参数详情 */}
              {toolDetail.params && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900">执行参数</h4>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                      {JSON.stringify(toolDetail.params, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* 结果详情 */}
              {toolDetail.result && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-gray-900">执行结果</h4>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>

                  <ToolResultContent tool={toolDetail.tool} result={toolDetail.result} />
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

interface ToolResultContentProps {
  tool: string;
  result: any;
}

const ToolResultContent: React.FC<ToolResultContentProps> = ({ tool, result }) => {
  switch (tool) {
    case 'search_images':
      return (
        <div className="space-y-3">
          <div className="text-sm text-gray-600">
            找到 {result.images?.length || 0} 张图片
          </div>

          {result.images?.map((image: any, index: number) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex gap-3">
                <img
                  src={image.url}
                  alt={image.description || '图片'}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 mb-1">
                    图片 {index + 1}
                  </div>
                  {image.description && (
                    <div className="text-xs text-gray-600">
                      {image.description}
                    </div>
                  )}
                  <div className="text-xs text-gray-400 mt-1">
                    {image.source}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );

    case 'web_search':
      return (
        <div className="space-y-3">
          <div className="text-sm text-gray-600">
            找到 {result.results?.length || 0} 个搜索结果
          </div>

          {result.results?.map((item: any, index: number) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="text-sm font-medium text-gray-900 mb-1">
                {item.title}
              </div>
              <div className="text-xs text-gray-600 mb-2">
                {item.snippet}
              </div>
              <div className="text-xs text-blue-600">
                {item.url}
              </div>
            </div>
          ))}
        </div>
      );

    case 'visit_page':
      return (
        <div className="space-y-3">
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="text-sm font-medium text-gray-900 mb-2">
              页面内容摘要
            </div>
            <div className="text-xs text-gray-600 whitespace-pre-wrap">
              {result.summary || result.content?.substring(0, 500) + '...'}
            </div>
          </div>
        </div>
      );

    case 'insert_page':
      return (
        <div className="space-y-3">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">幻灯片生成成功</span>
            </div>
            <div className="text-xs text-green-700">
              已插入第 {result.index + 1} 页幻灯片
            </div>
          </div>

          {result.html && (
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="text-sm font-medium text-gray-900 mb-2">
                幻灯片预览
              </div>
              <div
                className="text-xs text-gray-700 max-h-32 overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: result.html }}
              />
            </div>
          )}
        </div>
      );

    default:
      return (
        <div className="bg-gray-50 rounded-lg p-3">
          <pre className="text-xs text-gray-700 whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      );
  }
};
