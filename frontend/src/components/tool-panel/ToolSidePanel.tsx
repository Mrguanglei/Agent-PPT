'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Copy, Check, Share2, Maximize2, Minimize2,
  Terminal, Layout, Database, Clock, RefreshCw,
  Download, Star, Info, Play, ChevronDown, 
  ExternalLink, MoreHorizontal, MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToolPanelStore } from '@/stores/toolPanelStore';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set(['4']));
  
  // 状态保持：记录每个 Tab 的滚动位置
  const scrollPositions = useRef<{ [key: string]: number }>({
    process: 0,
    preview: 0,
    data: 0
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  const selectedTool = useMemo(() => 
    toolCalls.find((tc) => tc.index === selectedIndex),
    [toolCalls, selectedIndex]
  );

  // 模拟执行日志数据
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

  // 处理 Tab 切换时的滚动位置保持
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollPositions.current[activeTab];
    }
  }, [activeTab]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    scrollPositions.current[activeTab] = e.currentTarget.scrollTop;
  };

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
    <TooltipProvider delayDuration={0}>
      <motion.div
        initial={{ x: '100%', opacity: 0.5 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0.5 }}
        transition={{ 
          type: 'spring', 
          damping: 28, 
          stiffness: 260,
          mass: 0.8
        }}
        className={cn(
          "fixed right-0 top-0 bottom-0 z-50 bg-[#0f0f1e] border-l border-white/5 flex flex-col transition-[width] duration-500 ease-in-out shadow-[0_0_50px_rgba(0,0,0,0.5)]",
          isMaximized ? "w-[98vw]" : "w-[896px]"
        )}
      >
        {/* 头部 - 像素级复刻智谱头部 */}
        <div className="h-[72px] flex items-center justify-between px-6 border-b border-white/5 bg-[#0f0f1e]/95 backdrop-blur-xl sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
            >
              <Play className="w-5 h-5 fill-current" />
            </motion.div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2.5">
                <h2 className="text-[15px] font-bold text-white tracking-tight">
                  {selectedTool?.name || '任务执行规划'}
                </h2>
                <Badge className={cn(
                  "px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border-none",
                  selectedTool?.status === 'running' 
                    ? "bg-red-500/20 text-red-400 animate-pulse"
                    : "bg-emerald-500/20 text-emerald-400"
                )}>
                  {selectedTool?.status === 'running' ? 'RUNNING' : 'SUCCESS'}
                </Badge>
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

          {/* 操作按钮组 - 像素级 Hover 效果与 Tooltip */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleCopy}
                  className="h-9 w-9 rounded-full hover:bg-white/5 text-white/60 hover:text-white transition-all duration-200"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-white text-black text-[11px] font-bold py-1 px-2 rounded-md border-none">
                {copied ? '已复制' : '复制内容'}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 rounded-full hover:bg-white/5 text-white/60 hover:text-white transition-all duration-200"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-white text-black text-[11px] font-bold py-1 px-2 rounded-md border-none">
                分享详情
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsMaximized(!isMaximized)}
                  className="h-9 w-9 rounded-full hover:bg-white/5 text-white/60 hover:text-white transition-all duration-200"
                >
                  {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-white text-black text-[11px] font-bold py-1 px-2 rounded-md border-none">
                {isMaximized ? '退出全屏' : '全屏查看'}
              </TooltipContent>
            </Tooltip>

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
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.6)]" 
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 内容区域 - 深度复刻时间轴与状态保持 */}
        <div 
          ref={scrollRef} 
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto bg-[#0f0f1e] custom-scrollbar scroll-smooth"
        >
          <AnimatePresence mode="wait">
            {activeTab === 'process' && (
              <motion.div
                key="process"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="p-8 space-y-0"
              >
                {mockLogs.map((log, idx) => (
                  <div key={log.id} className="flex gap-6 group">
                    {/* 时间轴 - 像素级复刻 */}
                    <div className="flex flex-col items-center flex-shrink-0 pt-1.5">
                      <div className="relative">
                        {log.status === 'running' && (
                          <motion.div 
                            animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
                            transition={{ repeat: Infinity, duration: 2.5 }}
                            className="absolute inset-[-4px] rounded-full bg-blue-500/40"
                          />
                        )}
                        <div className={cn(
                          "w-2.5 h-2.5 rounded-full border-2 relative z-10 transition-all duration-500",
                          log.status === 'completed' ? "bg-emerald-500 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" :
                          log.status === 'running' ? "bg-blue-500 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" :
                          "bg-white/10 border-white/10"
                        )} />
                      </div>
                      {idx < mockLogs.length - 1 && (
                        <div className={cn(
                          "w-[1px] h-16 my-1 transition-colors duration-700",
                          log.status === 'completed' ? "bg-emerald-500/40" : "bg-white/5"
                        )} />
                      )}
                    </div>

                    {/* 日志内容 */}
                    <div className="flex-1 pb-8">
                      <button
                        onClick={() => toggleLog(log.id)}
                        className={cn(
                          "w-full text-left flex items-center justify-between p-3 -m-3 rounded-xl transition-all duration-300",
                          expandedLogs.has(log.id) ? "bg-white/[0.04]" : "hover:bg-white/[0.02]"
                        )}
                      >
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-3">
                            <span className={cn(
                              "text-[14px] font-bold tracking-tight transition-colors duration-300",
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
                          "w-4 h-4 text-white/20 transition-transform duration-500 ease-out",
                          expandedLogs.has(log.id) && "rotate-180 text-white/50"
                        )} />
                      </button>

                      <AnimatePresence initial={false}>
                        {expandedLogs.has(log.id) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="mt-4 p-5 bg-[#080810] rounded-2xl border border-white/5 font-mono text-[12px] leading-relaxed text-white/50 shadow-inner">
                              <div className="flex items-start gap-3">
                                <div className="text-blue-500/40 mt-1">
                                  <Terminal className="w-3.5 h-3.5" />
                                </div>
                                <div className="flex-1 whitespace-pre-wrap break-words">
                                  {log.content}
                                  {log.status === 'running' && (
                                    <motion.span
                                      animate={{ opacity: [1, 0, 1] }}
                                      transition={{ repeat: Infinity, duration: 0.8 }}
                                      className="inline-block w-1.5 h-3.5 ml-1 bg-blue-500/60 align-middle"
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
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="h-full flex flex-col items-center justify-center p-12 text-center"
              >
                <motion.div 
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 2, 0]
                  }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="w-28 h-28 rounded-[2.5rem] bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center mb-10 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
                >
                  <Layout className="w-12 h-12 text-blue-400/60" />
                </motion.div>
                <h3 className="text-[18px] font-bold text-white mb-4 tracking-tight">结果预览准备中</h3>
                <p className="text-[14px] text-white/40 max-w-[320px] leading-relaxed">
                  当 PPT 页面渲染完成后，您将能在这里看到高保真的幻灯片预览，并支持实时交互。
                </p>
                <div className="flex gap-3 mt-10">
                  <Button variant="outline" className="rounded-full border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white text-xs font-bold px-8 h-10">
                    查看生成指南
                  </Button>
                  <Button className="rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-8 h-10 shadow-lg shadow-blue-600/20">
                    立即刷新
                  </Button>
                </div>
              </motion.div>
            )}

            {activeTab === 'data' && (
              <motion.div
                key="data"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="p-8"
              >
                <div className="rounded-2xl border border-white/5 bg-[#080810] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.4)]">
                  <div className="px-6 py-4 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/40" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />
                      </div>
                      <span className="ml-4 text-[11px] font-black uppercase tracking-[0.2em] text-white/20">RAW_DATA.JSON</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 text-[11px] font-bold text-white/30 hover:text-white rounded-xl hover:bg-white/5 px-4">
                      <Download className="w-3.5 h-3.5 mr-2" /> DOWNLOAD
                    </Button>
                  </div>
                  <div className="p-8 font-mono text-[13px] leading-relaxed text-blue-400/60 overflow-x-auto custom-scrollbar max-h-[600px]">
                    <pre className="selection:bg-blue-500/30 selection:text-white">
                      {JSON.stringify(selectedTool || {}, null, 2)}
                    </pre>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 页脚 - 像素级复刻 */}
        <div className="px-8 py-5 border-t border-white/5 bg-[#0f0f1e]/80 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)] animate-pulse" />
            <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.3em]">
              PPT AGENT REAL-TIME ENGINE V2.0
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-9 text-[11px] font-bold text-white/30 hover:text-white rounded-xl hover:bg-white/5 px-5 transition-all">
              <Star className="w-3.5 h-3.5 mr-2" /> 收藏任务
            </Button>
            <Button variant="ghost" size="sm" className="h-9 text-[11px] font-bold text-white/30 hover:text-white rounded-xl hover:bg-white/5 px-5 transition-all">
              <Info className="w-3.5 h-3.5 mr-2" /> 运行详情
            </Button>
          </div>
        </div>

        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 5px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.03);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.08);
          }
          ::selection {
            background: rgba(59, 130, 246, 0.2);
            color: #fff;
          }
        `}</style>
      </motion.div>
    </TooltipProvider>
  );
}
