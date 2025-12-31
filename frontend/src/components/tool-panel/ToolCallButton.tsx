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
  ChevronRight,
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
  html: '生成内容',
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
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ backgroundColor: 'var(--accent)' }}
      onClick={onClick}
      className={cn(
        'group flex items-center justify-between w-full max-w-sm px-4 py-3 rounded-xl transition-all duration-200',
        'border border-border/50 bg-card/30 backdrop-blur-sm shadow-sm hover:shadow-md',
        'text-sm font-medium cursor-pointer'
      )}
    >
      <div className="flex items-center gap-3">
        {/* 工具图标容器 */}
        <div className={cn(
          'flex items-center justify-center w-8 h-8 rounded-lg transition-colors',
          status === 'running' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
        )}>
          {status === 'running' ? (
            <Loader2 className="w-4.5 h-4.5 animate-spin" />
          ) : (
            <Icon className="w-4.5 h-4.5" />
          )}
        </div>

        {/* 文字信息 */}
        <div className="flex flex-col items-start gap-0.5">
          <span className="text-foreground font-semibold">
            {TOOL_LABELS[name] || name}
          </span>
          <span className={cn(
            'text-[11px] uppercase tracking-wider font-bold',
            status === 'running' && 'text-primary animate-pulse',
            status === 'success' && 'text-success',
            status === 'failed' && 'text-destructive',
            status === 'pending' && 'text-muted-foreground'
          )}>
            {status === 'running' ? '正在执行...' : 
             status === 'success' ? '执行成功' : 
             status === 'failed' ? '执行失败' : '等待中'}
          </span>
        </div>
      </div>

      {/* 右侧指示器 */}
      <div className="flex items-center gap-2">
        {status === 'success' && <CheckCircle className="w-4 h-4 text-success" />}
        {status === 'failed' && <XCircle className="w-4 h-4 text-destructive" />}
        <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
      </div>
    </motion.button>
  );
}
