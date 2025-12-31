'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ToolCallButtonProps {
  index: number;
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'completed';
  onClick?: () => void;
}

const TOOL_LABELS: Record<string, string> = {
  think: '思考',
  initialize_slide: '初始化',
  insert_slides: '编写',
  html: '生成',
  update_slide: '更新',
  web_search: '搜索',
  search_images: '图片',
  visit_page: '访问',
};

export function ToolCallButton({ index, name, status, onClick }: ToolCallButtonProps) {
  const isRunning = status === 'running';
  const isSuccess = status === 'success' || status === 'completed';
  const isFailed = status === 'failed';

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center px-2.5 py-1 rounded text-xs font-bold uppercase tracking-widest cursor-pointer transition-all",
        "border border-current",
        isRunning && "bg-red-500/20 text-red-500 border-red-500/50 animate-pulse",
        isSuccess && "bg-emerald-500/20 text-emerald-500 border-emerald-500/50",
        isFailed && "bg-destructive/20 text-destructive border-destructive/50",
        !isRunning && !isSuccess && !isFailed && "bg-blue-500/20 text-blue-500 border-blue-500/50"
      )}
    >
      {TOOL_LABELS[name] || name}
    </motion.button>
  );
}
