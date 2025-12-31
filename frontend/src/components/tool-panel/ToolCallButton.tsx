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
  Terminal,
  Layout,
  FileJson
} from 'lucide-react';
import { cn } from '@/lib/utils';

const TOOL_ICONS: Record<string, any> = {
  think: FileText,
  initialize_slide: Layout,
  insert_slides: FileJson,
  html: FileText,
  update_slide: FileText,
  web_search: Search,
  search_images: Image,
  visit_page: Globe,
};

const TOOL_LABELS: Record<string, string> = {
  think: '思考规划',
  initialize_slide: '初始化幻灯片框架',
  insert_slides: '正在编写 PPT 页面内容',
  html: '生成内容',
  update_slide: '更新页面',
  web_search: '搜索相关素材与图片',
  search_images: '图片搜索',
  visit_page: '访问页面',
};

interface ToolCallButtonProps {
  index: number;
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'completed';
  onClick?: () => void;
}

export function ToolCallButton({ index, name, status, onClick }: ToolCallButtonProps) {
  const Icon = TOOL_ICONS[name] || Terminal;

  return (
    <motion.button
      whileHover={{ scale: 1.01, y: -1 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={cn(
        "group flex items-center justify-between w-full max-w-md p-3.5 rounded-2xl border transition-all duration-300",
        status === 'running' 
          ? "bg-primary/5 border-primary/20 shadow-sm shadow-primary/5" 
          : "bg-card border-border/50 hover:border-primary/30 hover:shadow-md"
      )}
    >
      <div className="flex items-center gap-3.5">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
          status === 'running' ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary"
        )}>
          {status === 'running' ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Icon className="w-5 h-5" />
          )}
        </div>
        <div className="flex flex-col items-start">
          <span className="text-[13px] font-black text-foreground tracking-tight">
            {TOOL_LABELS[name] || name}
          </span>
          <span className={cn(
            "text-[10px] font-bold uppercase tracking-widest mt-0.5",
            status === 'running' ? "text-primary animate-pulse" : "text-muted-foreground"
          )}>
            {status === 'running' ? '正在执行中...' : (status === 'success' || status === 'completed') ? '执行成功' : status === 'failed' ? '执行失败' : '等待执行'}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {(status === 'success' || status === 'completed') && <CheckCircle className="w-4 h-4 text-emerald-500" />}
        {status === 'failed' && <XCircle className="w-4 h-4 text-destructive" />}
        <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
      </div>
    </motion.button>
  );
}
