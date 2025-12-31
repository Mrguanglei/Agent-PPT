'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Copy, Check, Share2, Maximize2, Minimize2,
  Terminal, Layout, Database, Clock, RefreshCw,
  Download, Star, Info, Loader2, ChevronDown, Eye,
  ExternalLink, Play
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
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set(['4'])); // 默认展开正在执行的
  const scrollRef = useRef<HTMLDivElement>(null);

  const selectedTool = toolCalls.find((tc) => tc.index === selectedIndex);

  // 模拟执行日志数据 - 更加贴近智谱的排版
  const mockLogs: LogEntry[] = [
    {
      id: '1',
      type: 'thought',
      title: '任务目标分析',
      content: '分析用户需求：生成关于“博特智能公司产品介绍”的PPT。核心重点：内容安全大模型、智能审校、博特妙笔。',
      status: 'completed',
      timestamp: '10:24:01'
    },
    {
      id: '2',
      type: 'tool_call',
      title: '搜索网页：博特智能 公司简介',
      content: '正在从互联网获取博特智能的最新公司背景和融资信息...',
      status: 'completed',
      timestamp: '10:24:05'
    },
    {
      id: '3',
      type: 'tool_call',
      title: '访问页面：https://botsmart.cn/',
      content: '深入解析官网产品线，提取核心技术参数和应用场景。',
      status: 'completed',
      timestamp: '10:24:12'
    },
    {
      id: '4',
      type: 'tool_call',
      title: '生成 PPT 结构代码',
      content: '正在根据收集到的信息，使用 HTML/CSS 实时渲染幻灯片页面...',
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
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className={cn(
        "fixed right-0 top-0 bottom-0 z-50 bg-[#0f0f1e] border-l border-white/5 flex flex-col transition-all duration-500 shadow-2xl",
        isMaximized ? "w-[98vw]" : "w-[896px]"
      )}
    >
      {/* 头部 - 像素级复刻智谱头部 */}
      <div className="h-[72px] flex items-center justify-between px-6 border-b border-white/5 bg-[#0f0f1e]/90 backdrop-blur-xl sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
            <Play className="w-5 h-5 fill-current" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2.5">
              <h2 className="text-[15px] font-bold text-white tracking-tight">
                {selectedTool?.name || '任务执行规划'}
              </h2>
              <div className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter border",
                selectedTool?.status === 'running' 
                  ? "bg-red-500/10 text-red-400 border-red-500/20 animate-pulse"
                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              )}>
                {selectedTool?.status === 'running' ? 'RUNNING' : 'SUCCESS'}
              </div>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[11px] text-white/40 font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" />
                耗时: {selectedTool?.executionTime?.toFixed(2) || '0.02'}s
              </span>
              <div className="w-1 h-1 rounded-full bg-white/10" />
              <span className="text-[11px] text-white/40 font-medium flex items-center gap-1">
                <RefreshCw className="w-3 h-3" />
                状态: {selectedTool?.status === 'running' ? '执行中' : '执行已完成'}
              </span>
            </div>
          </div>
        </div>

        {/* 操作按钮组 - 像素级 Hover 效果 */}
        <div className="flex items-center gap-1">
          {[
            { icon: Copy, onClick: handleCopy, active: copied, color: 'text-emerald-400' },
            { icon: Share2 },
            { icon: Maximize2, onClick: () => setIsMaximized(!isMaximized), toggleIcon: Minimize2, isToggled: isMaximized },
          ].map((btn, i) => (
            <Button 
              key={i}
              variant="ghost" 
              size="icon" 
              onClick={btn.onClick}
              className="h-9 w-9 rounded-full hover:bg-white/5 text-white/60 hover:text-white transition-all duration-200"
            >
              {btn.active ? <Check className={cn("h-4 w-4", btn.color)} /> : 
               (btn.isToggled ? <btn.toggleIcon className="h-4 w-4" /> : <btn.icon className="h-4 w-4" />)}
            </Button>
          ))}
          <div className="w-px h-4 bg-white/10 mx-2" />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={closePanel}
            className="h-9 w-9 rounded-full hover:bg-red-500/10 hover:text-red-400 text-white/40 transition-all duration-200"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Tab 栏 - 像素级滑动动画 */}
      <div className="px-8 bg-[#0f0f1e] border-b border-white/5">
        <div className="flex items-center gap-10 relative">
          {[
            { id: 'process', label: '执行过程', icon: Terminal },
            { id: 'preview', label: '结果预览', icon: Layout },
            { id: 'data', label: '原始数据', icon: Database },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2.5 py-4 text-[13px] font-bold transition-all relative group",
                activeTab === tab.id 
                  ? "text-white" 
                  : "text-white/40 hover:text-white/70"
              )}
            >
              <tab.icon className={cn(
                "w-4 h-4 transition-colors",
                activeTab === tab.id ? "text-blue-400" : "text-white/20 group-hover:text-white/40"
              )} />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" 
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 内容区域 - 深度复刻时间轴 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto bg-[#0f0f1e] custom-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === 'process' && (
            <motion.div
              key="process"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-8 space-y-0"
            >
              {mockLogs.map((log, idx) => (
                <div key={log.id} className="flex gap-6 group">
                  {/* 时间轴 - 像素级复刻 */}
                  <div className="flex flex-col items-center flex-shrink-0 pt-1.5">
                    <div className="relative">
                      {log.status === 'running' && (
                        <motion.div 
                          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="absolute inset-0 rounded-full bg-blue-500/50"
                        />
                      )}
                      <div className={cn(
                        "w-2.5 h-2.5 rounded-full border-2 relative z-10 transition-all duration-500",
                        log.status === 'completed' ? "bg-emerald-500 border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" :
                        log.status === 'running' ? "bg-blue-500 border-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]" :
                        "bg-white/10 border-white/10"
                      )} />
                    </div>
                    {idx < mockLogs.length - 1 && (
                      <div className={cn(
                        "w-[1px] h-16 my-1 transition-colors duration-500",
                        log.status === 'completed' ? "bg-emerald-500/30" : "bg-white/5"
                      )} />
                    )}
                  </div>

                  {/* 日志内容 */}
                  <div className="flex-1 pb-8">
                    <button
                      onClick={() => toggleLog(log.id)}
                      className={cn(
                        "w-full text-left flex items-center justify-between p-3 -m-3 rounded-xl transition-all duration-200",
                        expandedLogs.has(log.id) ? "bg-white/[0.03]" : "hover:bg-white/[0.02]"
                      )}
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            "text-[14px] font-bold tracking-tight transition-colors",
                            log.status === 'completed' ? "text-white/90" : 
                            log.status === 'running' ? "text-blue-400" : "text-white/40"
                          )}>
                            {log.title}
                          </span>
                          <span className="text-[10px] font-medium text-white/20 tabular-nums">
                            {log.timestamp}
                          </span>
                        </div>
                      </div>
                      <ChevronDown className={cn(
                        "w-4 h-4 text-white/20 transition-transform duration-300",
                        expandedLogs.has(log.id) && "rotate-180 text-white/40"
                      )} />
                    </button>

                    <AnimatePresence>
                      {expandedLogs.has(log.id) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 p-4 bg-black/40 rounded-xl border border-white/5 font-mono text-[12px] leading-relaxed text-white/50">
                            <div className="flex items-start gap-3">
                              <div className="text-blue-500/50 mt-1">
                                <Terminal className="w-3.5 h-3.5" />
                              </div>
                              <div className="flex-1 whitespace-pre-wrap break-words">
                                {log.content}
                                {log.status === 'running' && (
                                  <motion.span
                                    animate={{ opacity: [1, 0, 1] }}
                                    transition={{ repeat: Infinity, duration: 0.8 }}
                                    className="inline-block w-1.5 h-3.5 ml-1 bg-blue-500/50 align-middle"
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'preview' && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="h-full flex flex-col items-center justify-center p-12 text-center"
            >
              <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center mb-8 border border-white/5 shadow-inner">
                <Layout className="w-10 h-10 text-blue-400/50" />
              </div>
              <h3 className="text-[17px] font-bold text-white mb-3 tracking-tight">结果预览准备中</h3>
              <p className="text-[13px] text-white/40 max-w-[280px] leading-relaxed">
                当 PPT 页面渲染完成后，您将能在这里看到高保真的幻灯片预览。
              </p>
              <Button variant="outline" className="mt-8 rounded-full border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white text-xs font-bold px-6">
                查看生成指南
              </Button>
            </motion.div>
          )}

          {activeTab === 'data' && (
            <motion.div
              key="data"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-8"
            >
              <div className="rounded-2xl border border-white/5 bg-black/40 overflow-hidden shadow-2xl">
                <div className="px-5 py-4 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500/50" />
                    <div className="w-2 h-2 rounded-full bg-amber-500/50" />
                    <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
                    <span className="ml-3 text-[11px] font-black uppercase tracking-widest text-white/30">RAW_DATA.JSON</span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 text-[11px] font-bold text-white/40 hover:text-white rounded-xl hover:bg-white/5">
                    <Download className="w-3.5 h-3.5 mr-2" /> DOWNLOAD
                  </Button>
                </div>
                <div className="p-6 font-mono text-[12px] leading-relaxed text-blue-400/70 overflow-x-auto bg-[#080810] max-h-[500px] custom-scrollbar">
                  <pre>{JSON.stringify(selectedTool || {}, null, 2)}</pre>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 页脚 - 像素级复刻 */}
      <div className="px-8 py-4 border-t border-white/5 bg-[#0f0f1e]/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em]">
            PPT AGENT REAL-TIME ENGINE
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 text-[11px] font-bold text-white/30 hover:text-white rounded-xl hover:bg-white/5 px-4">
            <Star className="w-3.5 h-3.5 mr-2" /> 收藏任务
          </Button>
          <Button variant="ghost" size="sm" className="h-8 text-[11px] font-bold text-white/30 hover:text-white rounded-xl hover:bg-white/5 px-4">
            <Info className="w-3.5 h-3.5 mr-2" /> 运行详情
          </Button>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </motion.div>
  );
}
