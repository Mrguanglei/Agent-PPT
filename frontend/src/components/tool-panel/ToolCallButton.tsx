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
      className="inline-flex items-center gap-1.5 h-8 px-2 py-1.5 text-xs text-muted-foreground bg-card hover:bg-card/80 rounded-lg transition-colors cursor-pointer border border-neutral-200 dark:border-neutral-700/50 whitespace-nowrap"
    >
      <div className='flex items-center justify-center'>
        <span className="text-sm">
          {TOOL_ICONS[name] || '🔧'}
        </span>
      </div>
      <span className="font-mono text-xs text-foreground">
        {TOOL_LABELS[name] || name}
      </span>
      {isRunning && (
        <Loader2 className="h-3.5 w-3.5 text-blue-500 animate-spin animation-duration-2000 ml-1" />
      )}
      {isSuccess && (
        <CheckCircle className="h-3.5 w-3.5 text-green-500 ml-1" />
      )}
      {isFailed && (
        <XCircle className="h-3.5 w-3.5 text-red-500 ml-1" />
      )}
    </motion.button>
  );
}
