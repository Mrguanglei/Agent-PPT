'use client';

import { motion } from 'framer-motion';
import {
  Image,
  Search,
  Globe,
  FileText,
  Loader2,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ToolCallStatus } from '@/types/tool';

const TOOL_ICONS: Record<string, any> = {
  think: FileText,
  initialize_slide: FileText,
  insert_slides: FileText,
  html: FileText,
  update_slide: FileText,
  web_search: Search,
  search_images: Image,
  visit_page: Globe,
};

const TOOL_LABELS: Record<string, string> = {
  think: '思考规划',
  initialize_slide: '初始化幻灯片',
  insert_slides: '插入页面',
  html: '生成HTML',
  update_slide: '更新页面',
  web_search: '网页搜索',
  search_images: '图片搜索',
  visit_page: '访问页面',
};

interface ToolCallButtonProps {
  index: number;
  name: string;
  status: ToolCallStatus;
  onClick?: () => void;
}

export function ToolCallButton({ index, name, status, onClick }: ToolCallButtonProps) {
  const Icon = TOOL_ICONS[name] || FileText;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg',
        'text-sm font-medium transition-all',
        'border cursor-pointer',

        // 状态样式
        status === 'pending' && 'bg-muted border-border text-muted-foreground',
        status === 'running' && 'bg-primary/10 border-primary/30 text-primary',
        status === 'success' && 'bg-green-500/10 border-green-500/30 text-green-500',
        status === 'failed' && 'bg-destructive/10 border-destructive/30 text-destructive',
      )}
    >
      {/* 状态图标 */}
      {status === 'running' ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : status === 'success' ? (
        <CheckCircle className="w-4 h-4" />
      ) : status === 'failed' ? (
        <XCircle className="w-4 h-4" />
      ) : (
        <Icon className="w-4 h-4" />
      )}

      <span>{TOOL_LABELS[name] || name}</span>
    </motion.button>
  );
}
