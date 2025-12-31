'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Maximize2, Minimize2, Share2, Copy, 
  Check, Code2, Layout, FileJson, Terminal,
  ChevronRight, Info, AlertCircle, Loader2,
  Clock, RefreshCw, Zap, Database, Star, Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToolPanelStore } from '@/stores/toolPanelStore';
import { cn } from '@/lib/utils';
import { ExecutionLog } from './ExecutionLog';
import { Badge } from '@/components/ui/badge';

export function ToolSidePanel() {
  const { isOpen, closePanel, selectedIndex, toolCalls } = useToolPanelStore();
  const [isMaximized, setIsMaximized] = useState(false);
  const [activeTab, setActiveTab] = useState<'process' | 'preview' | 'data'>('process');
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const selectedTool = toolCalls.find((tc) => tc.index === selectedIndex);

  // 自动滚动到底部，模拟实时流效果
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedTool?.params, selectedTool?.result]);

  const handleCopy = () => {
    const content = activeTab === 'data' 
      ? JSON.stringify(selectedTool || {}, null, 2)
      : JSON.stringify(selectedTool?.result || {}, null, 2);
    
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen || !selectedTool) return null;

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className={cn(
        "fixed right-0 top-0 bottom-0 z-50 bg-card border-l border-border shadow-2xl flex flex-col transition-all duration-500",
        isMaximized ? "w-[95vw]" : "w-[896px]"
      )}
    >
      {/* 头部区域 - 精致化重构 */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-border/50 bg-card/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-foreground tracking-tight">
                {selectedTool?.name || '任务执行规划'}
              </h2>
              <Badge variant="outline" className="rounded-full bg-primary/5 text-primary border-primary/20 text-[10px] font-bold uppercase">
                {selectedTool?.status}
              </Badge>
            </div>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                <Clock className="w-3 h-3" />
                耗时: {selectedTool?.executionTime?.toFixed(2) || '0.00'}s
              </span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                <RefreshCw className="w-3 h-3" />
                状态: {selectedTool?.status === 'running' ? '正在实时编写代码...' : '执行已完成'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" onClick={handleCopy} className="h-10 w-10 rounded-xl hover:bg-muted">
            {copied ? <Check className="h-5 w-5 text-emerald-500" /> : <Copy className="h-5 w-5" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-muted">
            <Share2 className="h-5 w-5" />
          </Button>
          <div className="w-px h-6 bg-border/60 mx-1" />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsMaximized(!isMaximized)}
            className="h-10 w-10 rounded-xl hover:bg-muted"
          >
            {isMaximized ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={closePanel} className="h-10 w-10 rounded-xl hover:bg-destructive/10 hover:text-destructive">
            <X className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* 标签页切换 - ChatGLM 风格 */}
      <div className="px-6 pt-4 bg-card">
        <div className="flex items-center gap-8 border-b border-border/50 relative">
          {[
            { id: 'process', label: '执行过程', icon: Terminal },
            { id: 'preview', label: '结果预览', icon: Layout },
            { id: 'data', label: '原始数据', icon: Database },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 py-4 text-sm font-bold transition-all relative",
                activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" 
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 内容区域 - 实时流展示 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 scrollbar-none bg-muted/30">
        <AnimatePresence mode="wait">
          {activeTab === 'process' && (
            <motion.div
              key="process"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8 max-w-4xl mx-auto"
            >
              {/* 实时代码流展示区 */}
              <div className="rounded-[24px] border border-border/50 bg-card shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 bg-muted/50 border-b border-border/50 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400/20 border border-red-400/40" />
                      <div className="w-3 h-3 rounded-full bg-amber-400/20 border border-amber-400/40" />
                      <div className="w-3 h-3 rounded-full bg-emerald-400/20 border border-emerald-400/40" />
                    </div>
                    <span className="text-[11px] font-black text-muted-foreground uppercase tracking-widest ml-2">PPT 代码实时编写中...</span>
                  </div>
                  {selectedTool.status === 'running' && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
                </div>
                <div className="p-6 font-mono text-[13px] leading-relaxed bg-[#0d1117] text-gray-300 overflow-x-auto min-h-[200px]">
                  <pre className="whitespace-pre-wrap">
                    {selectedTool?.params ? JSON.stringify(selectedTool.params, null, 2) : '// 正在初始化 PPT 引擎...'}
                  </pre>
                </div>
              </div>

              <ExecutionLog logs={[]} />
            </motion.div>
          )}

          {activeTab === 'preview' && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full flex flex-col items-center justify-center text-center p-12"
            >
              <div className="w-24 h-24 rounded-[32px] bg-primary/5 flex items-center justify-center mb-8">
                <Layout className="w-12 h-12 text-primary/40" />
              </div>
              <h3 className="text-xl font-black text-foreground mb-3">结果预览准备中</h3>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                当 PPT 页面渲染完成后，您将能在这里看到高保真的幻灯片预览。
              </p>
            </motion.div>
          )}

          {activeTab === 'data' && (
            <motion.div
              key="data"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-[24px] border border-border/50 bg-[#0d1117] p-8 font-mono text-[13px] text-gray-300 overflow-x-auto"
            >
              <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-white/50">完整 JSON 数据</span>
                <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold text-white/70 hover:text-white hover:bg-white/10">
                  <Download className="w-3.5 h-3.5 mr-2" /> 下载 JSON
                </Button>
              </div>
              <pre>{JSON.stringify(selectedTool || {}, null, 2)}</pre>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 页脚 - 免责声明 */}
      <div className="px-8 py-4 border-t border-border/50 bg-card/50 flex items-center justify-between">
        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
          由 PPT Agent 实时生成 • 仅供参考
        </p>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 text-[11px] font-bold rounded-lg">
            <Star className="w-3.5 h-3.5 mr-1.5" /> 收藏
          </Button>
          <Button variant="ghost" size="sm" className="h-8 text-[11px] font-bold rounded-lg">
            <Info className="w-3.5 h-3.5 mr-1.5" /> 详情
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
