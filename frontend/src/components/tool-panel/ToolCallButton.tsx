'use client';

import { motion } from 'framer-motion';
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToolCallButtonProps {
  index: number;
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  onClick?: () => void;
}

const TOOL_LABELS: Record<string, string> = {
  think: '思考',
  initialize_slide: '初始化幻灯片',
  insert_slides: '插入幻灯片',
  html: '生成内容',
  update_slide: '更新幻灯片',
  web_search: '网页搜索',
  search_images: '图片搜索',
  visit_page: '访问页面',
};

const TOOL_ICONS: Record<string, string> = {
  think: '💭',
  initialize_slide: '📊',
  insert_slides: '📄',
  html: '🎨',
  update_slide: '✏️',
  web_search: '🔍',
  search_images: '🖼️',
  visit_page: '🌐',
};

export function ToolCallButton({ index, name, status, onClick }: ToolCallButtonProps) {
  const isRunning = status === 'running';
  const isSuccess = status === 'success';
  const isFailed = status === 'failed';
  const isPending = status === 'pending';

  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={cn(
        "w-full text-left px-3 py-2 rounded-lg border transition-all duration-200",
        "flex items-center gap-3 text-sm",
        "hover:border-blue-400 hover:shadow-sm",
        isPending && "bg-gray-100 border-gray-300 text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300",
        isRunning && "bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300",
        isSuccess && "bg-green-100 border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300",
        isFailed && "bg-red-100 border-red-300 text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300"
      )}
    >
      {/* Icon */}
      <span className="text-base flex-shrink-0">
        {TOOL_ICONS[name] || '🔧'}
      </span>

      {/* Tool Name */}
      <span className="flex-1 font-medium">
        {TOOL_LABELS[name] || name}
      </span>

      {/* Status Indicator */}
      <span className="flex-shrink-0">
        {isPending && <Clock className="w-4 h-4 text-gray-400" />}
        {isRunning && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
        {isSuccess && <CheckCircle className="w-4 h-4 text-green-500" />}
        {isFailed && <XCircle className="w-4 h-4 text-red-500" />}
      </span>
    </motion.button>
  );
}
