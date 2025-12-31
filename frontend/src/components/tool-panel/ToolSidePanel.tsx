'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Clock, CheckCircle, XCircle, Loader2, Code, FileText, Zap, 
  Play, Pause, AlertCircle, Info, Download, ExternalLink, 
  Copy, Image as ImageIcon, ZoomIn, Star, Edit3, Share2,
  Terminal, Layout, Database, ChevronDown, ChevronUp,
  Maximize2, Minimize2, RefreshCw
} from 'lucide-react';
import { useToolPanelStore } from '@/stores/toolPanelStore';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ExecutionLog, type LogStep } from './ExecutionLog';

export function ToolSidePanel() {
  const { isOpen, closePanel, selectedIndex, toolCalls } = useToolPanelStore();
  const [activeTab, setActiveTab] = useState<'process' | 'result' | 'raw'>('process');
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const CONTENT_PX = 896; // 896px
  
  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const selectedTool = toolCalls.find((tc) => tc.index === selectedIndex);

  // 模拟执行日志数据 (实际应从 store 获取)
  const mockLogs: LogStep[] = [
    {
      id: '1',
      type: 'thought',
      title: '任务分析',
      content: '用户需要生成关于博特智能的产品介绍。我将首先搜索该公司的基本信息、产品线和技术优势。',
      status: 'completed',
      timestamp: '10:24:01'
    },
    {
      id: '2',
      type: 'tool_call',
      title: '网页搜索',
      content: '正在搜索：博特智能 公司简介 产品线 AI算法',
      status: 'completed',
      timestamp: '10:24:05',
      subSteps: [
        { title: '搜索关键词：博特智能 简介', status: 'completed' },
        { title: '搜索关键词：博特智能 产品线', status: 'completed' },
        { title: '分析搜索结果', status: 'completed' }
      ]
    },
    {
      id: '3',
      type: 'tool_call',
      title: '浏览网页',
      content: '正在访问：https://botsmart.cn/',
      status: 'running',
      timestamp: '10:24:12',
      subSteps: [
        { title: '加载页面内容', status: 'completed' },
        { title: '提取产品介绍', status: 'running' },
        { title: '分析技术架构', status: 'pending' }
      ]
    }
  ];

  if (!isOpen || !selectedTool) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        style={{
          width: isFullscreen ? '100%' : (windowWidth > CONTENT_PX ? `${CONTENT_PX}px` : '100%'),
          right: 0
        }}
        className="fixed top-0 h-full z-50 bg-background border-l border-border shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header - ChatGLM 风格：简洁、带操作按钮 */}
        <div className="flex flex-col border-b border-border bg-card/50 backdrop-blur-md">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-xl text-foreground tracking-tight">
                    {selectedTool.name || '工具详情'}
                  </h3>
                  <Badge variant="outline" className="rounded-full bg-primary/5 text-primary border-primary/20 text-[10px] font-bold uppercase">
                    {selectedTool.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    执行耗时: {selectedTool.executionTime?.toFixed(2) || '0.00'}s
                  </span>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <span className="flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" />
                    最后更新: 刚刚
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-xl h-10 w-10 hover:bg-muted transition-all"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </Button>
              <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 hover:bg-muted transition-all">
                <Share2 className="w-5 h-5" />
              </Button>
              <div className="w-px h-6 bg-border mx-1" />
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-xl h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-destructive/10 hover:text-destructive transition-all" 
                onClick={closePanel}
              >
                <X className="w-6 h-6" />
              </Button>
            </div>
          </div>

          {/* Tabs - 模仿 ChatGLM 的切换栏 */}
          <div className="px-6">
            <div className="flex gap-8">
              {[
                { id: 'process', label: '执行过程', icon: Terminal },
                { id: 'result', label: '结果预览', icon: Layout },
                { id: 'raw', label: '原始数据', icon: Database },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex items-center gap-2 py-4 text-sm font-bold transition-all relative",
                    activeTab === tab.id 
                      ? "text-primary" 
                      : "text-muted-foreground hover:text-foreground"
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
        </div>

        {/* Content Area */}
        <ScrollArea className="flex-1">
          <div className="p-8 max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              {activeTab === 'process' && (
                <motion.div
                  key="process"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="mb-8">
                    <h4 className="text-lg font-black text-foreground mb-2">执行日志</h4>
                    <p className="text-sm text-muted-foreground">实时追踪工具的思考与执行过程</p>
                  </div>
                  <ExecutionLog logs={mockLogs} />
                </motion.div>
              )}

              {activeTab === 'result' && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  {/* Input/Output Comparison - ChatGLM 风格 */}
                  <div className="grid grid-cols-1 gap-6">
                    <div className="rounded-2xl border border-border bg-card overflow-hidden">
                      <div className="px-5 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
                        <Code className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold uppercase tracking-wider">输入参数</span>
                      </div>
                      <div className="p-5">
                        <pre className="text-xs font-mono text-muted-foreground bg-muted/20 p-4 rounded-xl overflow-x-auto">
                          {JSON.stringify(selectedTool.args, null, 2)}
                        </pre>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-primary/20 bg-primary/5 overflow-hidden shadow-sm">
                      <div className="px-5 py-3 border-b border-primary/10 bg-primary/10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-primary" />
                          <span className="text-xs font-bold uppercase tracking-wider text-primary">输出结果</span>
                        </div>
                        <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold gap-1.5 rounded-lg">
                          <Copy className="w-3 h-3" /> 复制结果
                        </Button>
                      </div>
                      <div className="p-5">
                        {selectedTool.result ? (
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            {typeof selectedTool.result === 'string' ? (
                              <p className="text-sm leading-relaxed">{selectedTool.result}</p>
                            ) : (
                              <pre className="text-xs font-mono p-4 bg-background/50 rounded-xl overflow-x-auto border border-primary/5">
                                {JSON.stringify(selectedTool.result, null, 2)}
                              </pre>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <Loader2 className="w-8 h-8 animate-spin mb-4 opacity-20" />
                            <p className="text-sm font-medium">正在等待结果生成...</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'raw' && (
                <motion.div
                  key="raw"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="px-5 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs font-bold uppercase tracking-wider">完整 JSON 数据</span>
                      </div>
                      <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold gap-1.5 rounded-lg">
                        <Download className="w-3 h-3" /> 下载 JSON
                      </Button>
                    </div>
                    <div className="p-0">
                      <pre className="text-[11px] font-mono text-muted-foreground p-6 overflow-x-auto leading-relaxed">
                        {JSON.stringify(selectedTool, null, 2)}
                      </pre>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>

        {/* Footer - ChatGLM 风格：带反馈和快速操作 */}
        <div className="px-8 py-4 border-t border-border bg-card/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <p className="text-[10px] text-muted-foreground font-medium">
              该结果由 AI 自动生成，仅供参考
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-[11px] font-bold rounded-lg h-8">
              <Star className="w-3.5 h-3.5 mr-1.5" /> 收藏
            </Button>
            <Button variant="ghost" size="sm" className="text-[11px] font-bold rounded-lg h-8">
              <Info className="w-3.5 h-3.5 mr-1.5" /> 详情
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
