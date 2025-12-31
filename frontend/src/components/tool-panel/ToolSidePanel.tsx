'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Copy, Check, Share2, Maximize2, Minimize2,
  Terminal, Layout, Database, Clock, RefreshCw,
  Download, Star, Info, Loader2, ChevronDown, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToolPanelStore } from '@/stores/toolPanelStore';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface LogEntry {
  id: string;
  type: 'thought' | 'tool_call' | 'result';
  title: string;
  content: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  timestamp: string;
}

export function ToolSidePanel() {
  const { isOpen, closePanel, selectedIndex, toolCalls } = useToolPanelStore();
  const [isMaximized, setIsMaximized] = useState(false);
  const [activeTab, setActiveTab] = useState<'process' | 'preview' | 'data'>('process');
  const [copied, setCopied] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  const selectedTool = toolCalls.find((tc) => tc.index === selectedIndex);

  // 模拟执行日志数据
  const mockLogs: LogEntry[] = [
    {
      id: '1',
      type: 'thought',
      title: '任务分析',
      content: '用户需要生成关于 AI 发展历史的 PPT。我将首先规划大纲结构。',
      status: 'completed',
      timestamp: '10:24:01'
    },
    {
      id: '2',
      type: 'tool_call',
      title: '初始化幻灯片框架',
      content: '正在初始化 PPT 框架...',
      status: 'completed',
      timestamp: '10:24:05'
    },
    {
      id: '3',
      type: 'tool_call',
      title: '搜索图片',
      content: '正在搜索相关素材...',
      status: 'completed',
      timestamp: '10:24:12'
    },
    {
      id: '4',
      type: 'tool_call',
      title: '编写 PPT 页面内容',
      content: '正在编写幻灯片内容...',
      status: 'running',
      timestamp: '10:24:18'
    }
  ];

  const handleCopy = () => {
    const content = activeTab === 'data' 
      ? JSON.stringify(selectedTool || {}, null, 2)
      : JSON.stringify(selectedTool?.result || {}, null, 2);
    
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleLog = (id: string) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedLogs(newExpanded);
  };

  if (!isOpen || !selectedTool) return null;

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className={cn(
        "fixed right-0 top-0 bottom-0 z-50 bg-slate-900 border-l border-slate-700/50 flex flex-col transition-all duration-500",
        isMaximized ? "w-[95vw]" : "w-[896px]"
      )}
    >
      {/* 头部 - 深色背景设计 */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
            <Eye className="w-5.5 h-5.5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">
                {selectedTool?.name || '工具详情'}
              </h2>
              <Badge 
                variant="outline" 
                className={cn(
                  "rounded-full text-[10px] font-bold uppercase px-2 py-0.5 border",
                  selectedTool?.status === 'running' 
                    ? "bg-red-500/20 text-red-400 border-red-500/30"
                    : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                )}
              >
                {selectedTool?.status === 'running' ? '执行中' : '已完成'}
              </Badge>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" />
                耗时: {selectedTool?.executionTime?.toFixed(2) || '0.00'}s
              </span>
              <span className="w-px h-3 bg-slate-700/50" />
              <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                <RefreshCw className="w-3 h-3" />
                状态: {selectedTool?.status === 'running' ? '正在执行' : '已完成'}
              </span>
            </div>
          </div>
        </div>

        {/* 操作按钮组 */}
        <div className="flex items-center gap-1.5">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleCopy} 
            className="h-9 w-9 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white"
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <div className="w-px h-5 bg-slate-700/50 mx-0.5" />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsMaximized(!isMaximized)}
            className="h-9 w-9 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white"
          >
            {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={closePanel}
            className="h-9 w-9 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-slate-400"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Tab 栏 */}
      <div className="px-6 pt-4 bg-slate-900 border-b border-slate-700/50">
        <div className="flex items-center gap-8 relative">
          {[
            { id: 'process', label: '执行过程', icon: Terminal },
            { id: 'preview', label: '结果预览', icon: Layout },
            { id: 'data', label: '原始数据', icon: Database },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 py-3 text-sm font-bold transition-all relative pb-3",
                activeTab === tab.id 
                  ? "text-white" 
                  : "text-slate-400 hover:text-slate-300"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" 
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 内容区域 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto bg-slate-900">
        <AnimatePresence mode="wait">
          {activeTab === 'process' && (
            <motion.div
              key="process"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6 space-y-6"
            >
              {/* 执行日志时间轴 */}
              {mockLogs.map((log, idx) => (
                <div key={log.id} className="flex gap-4">
                  {/* 时间轴 */}
                  <div className="flex flex-col items-center gap-2 pt-1 flex-shrink-0">
                    <div className={cn(
                      "w-3 h-3 rounded-full border-2 transition-all",
                      log.status === 'completed' ? "bg-emerald-500 border-emerald-500" :
                      log.status === 'running' ? "bg-blue-500 border-blue-500 animate-pulse" :
                      "bg-slate-600 border-slate-600"
                    )} />
                    {idx < mockLogs.length - 1 && (
                      <div className="w-0.5 h-12 bg-slate-700/50" />
                    )}
                  </div>

                  {/* 日志内容 */}
                  <div className="flex-1 pb-2">
                    <button
                      onClick={() => toggleLog(log.id)}
                      className="w-full text-left flex items-center justify-between hover:bg-slate-800/50 p-2 rounded-lg transition-colors"
                    >
                      <div className="flex flex-col gap-0.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">
                            {log.title}
                          </span>
                          <span className={cn(
                            "text-[10px] font-bold uppercase tracking-widest",
                            log.status === 'completed' ? "text-emerald-400" :
                            log.status === 'running' ? "text-blue-400" :
                            "text-slate-500"
                          )}>
                            {log.status === 'completed' ? '完成' :
                             log.status === 'running' ? '执行中' :
                             '等待'}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500">
                          {log.timestamp}
                        </span>
                      </div>
                      <ChevronDown className={cn(
                        "w-4 h-4 text-slate-600 transition-transform",
                        expandedLogs.has(log.id) && "rotate-180"
                      )} />
                    </button>

                    {/* 展开的详情 */}
                    {expandedLogs.has(log.id) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50"
                      >
                        <pre className="text-[11px] font-mono text-slate-400 whitespace-pre-wrap break-words">
                          {log.content}
                        </pre>
                      </motion.div>
                    )}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'preview' && (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center p-12 text-center"
            >
              <div className="w-20 h-20 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-6 border border-slate-700/50">
                <Layout className="w-10 h-10 text-slate-600" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">结果预览准备中</h3>
              <p className="text-sm text-slate-400 max-w-xs">
                当 PPT 页面渲染完成后，您将能在这里看到高保真的幻灯片预览。
              </p>
            </motion.div>
          )}

          {activeTab === 'data' && (
            <motion.div
              key="data"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6"
            >
              <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 overflow-hidden">
                <div className="px-4 py-3 bg-slate-800 border-b border-slate-700/50 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">完整 JSON 数据</span>
                  <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold text-slate-400 hover:text-white rounded-lg">
                    <Download className="w-3 h-3 mr-1.5" /> 下载
                  </Button>
                </div>
                <div className="p-4 font-mono text-[11px] text-slate-400 overflow-x-auto bg-slate-900 max-h-96 overflow-y-auto">
                  <pre>{JSON.stringify(selectedTool || {}, null, 2)}</pre>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 页脚 */}
      <div className="px-6 py-3 border-t border-slate-700/50 bg-slate-900/50 flex items-center justify-between">
        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">
          由 PPT Agent 实时生成
        </p>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold text-slate-400 hover:text-white rounded-lg">
            <Star className="w-3 h-3 mr-1.5" /> 收藏
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold text-slate-400 hover:text-white rounded-lg">
            <Info className="w-3 h-3 mr-1.5" /> 详情
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
