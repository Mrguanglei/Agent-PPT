'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Clock, CheckCircle, XCircle, Loader2, Code, FileText, Zap, 
  Play, Pause, AlertCircle, Info, Download, ExternalLink, 
  Copy, Image as ImageIcon, ZoomIn, Star, Edit3, Share2,
  Terminal, Layout, Database, ChevronDown, ChevronUp
} from 'lucide-react';
import { useToolPanelStore } from '@/stores/toolPanelStore';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TOOL_LABELS } from '@/lib/constants';
import LightboxListener from './LightboxListener';

export function ToolSidePanel() {
  const { isOpen, closePanel, selectedIndex, toolCalls, updateToolCall } = useToolPanelStore();
  const [activeTab, setActiveTab] = useState<'process' | 'result' | 'raw'>('process');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editValue, setEditValue] = useState<string>('');
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 0);

  const CONTENT_PX = 56 * 16; // 896px
  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const selectedTool = toolCalls.find((tc) => tc.index === selectedIndex);

  // 自动切换标签页：如果有结果则显示结果，否则显示过程
  useEffect(() => {
    if (selectedTool?.result) {
      setActiveTab('result');
    } else {
      setActiveTab('process');
    }
  }, [selectedIndex, selectedTool?.result]);

  return (
    <AnimatePresence>
      {isOpen && selectedTool && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          style={
            windowWidth > CONTENT_PX
              ? { width: `${CONTENT_PX}px`, right: 0 }
              : { width: '100%', right: 0 }
          }
          className="fixed top-0 h-full z-50 bg-background border-l border-border shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header - ChatGLM 风格：简洁、带标签页 */}
          <div className="flex flex-col border-b border-border bg-card/50 backdrop-blur-md">
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground leading-none">
                    {getToolLabel(selectedTool?.name)}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-2">
                    <StatusBadge status={selectedTool?.status} />
                    {selectedTool?.executionTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {selectedTool.executionTime.toFixed(2)}s
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9" onClick={() => setShowShareModal(true)}>
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 text-muted-foreground hover:text-foreground" onClick={closePanel}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Tabs - 模仿 ChatGLM 的切换栏 */}
            <div className="px-6">
              <div className="flex gap-6">
                {[
                  { id: 'process', label: '执行过程', icon: Terminal },
                  { id: 'result', label: '结果预览', icon: Layout },
                  { id: 'raw', label: '原始数据', icon: Database },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      'flex items-center gap-2 py-3 text-sm font-medium transition-all relative',
                      activeTab === tab.id 
                        ? 'text-primary' 
                        : 'text-muted-foreground hover:text-foreground'
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
          <ScrollArea className="flex-1 bg-muted/5">
            <div className="p-6 max-w-4xl mx-auto w-full">
              <AnimatePresence mode="wait">
                {activeTab === 'process' && (
                  <motion.div
                    key="process"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    {/* 执行日志风格 */}
                    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
                      <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">执行日志</span>
                        <Badge variant="outline" className="text-[10px]">LIVE</Badge>
                      </div>
                      <div className="p-4 font-mono text-sm space-y-2 bg-black/5 dark:bg-white/5">
                        <div className="flex gap-3">
                          <span className="text-muted-foreground">10:24:01</span>
                          <span className="text-blue-500 font-bold">[INFO]</span>
                          <span>初始化工具: {selectedTool.name}</span>
                        </div>
                        <div className="flex gap-3">
                          <span className="text-muted-foreground">10:24:02</span>
                          <span className="text-blue-500 font-bold">[INFO]</span>
                          <span>解析输入参数...</span>
                        </div>
                        <div className="flex gap-3 pl-16 text-xs text-muted-foreground italic">
                          {JSON.stringify(selectedTool.params)}
                        </div>
                        {selectedTool.status === 'running' && (
                          <div className="flex gap-3 animate-pulse">
                            <span className="text-muted-foreground">10:24:03</span>
                            <span className="text-yellow-500 font-bold">[RUN]</span>
                            <span>正在处理请求，请稍候...</span>
                          </div>
                        )}
                        {selectedTool.status === 'success' && (
                          <div className="flex gap-3">
                            <span className="text-muted-foreground">10:24:05</span>
                            <span className="text-green-500 font-bold">[DONE]</span>
                            <span>执行成功，已生成结果。</span>
                          </div>
                        )}
                        {selectedTool.error && (
                          <div className="flex gap-3">
                            <span className="text-muted-foreground">10:24:05</span>
                            <span className="text-destructive font-bold">[ERROR]</span>
                            <span className="text-destructive">{selectedTool.error}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'result' && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    {!selectedTool.result ? (
                      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                        <Layout className="w-12 h-12 mb-4 opacity-20" />
                        <p>暂无结果预览</p>
                      </div>
                    ) : (
                      <ToolResultView toolName={selectedTool.name} result={selectedTool.result} />
                    )}
                  </motion.div>
                )}

                {activeTab === 'raw' && (
                  <motion.div
                    key="raw"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      <section>
                        <h4 className="text-sm font-bold mb-2 flex items-center gap-2">
                          <div className="w-1.5 h-4 bg-primary rounded-full" />
                          输入参数 (Input)
                        </h4>
                        <div className="rounded-xl border border-border bg-card p-4 overflow-auto max-h-[300px]">
                          <pre className="text-xs font-mono leading-relaxed">
                            {JSON.stringify(selectedTool.params, null, 2)}
                          </pre>
                        </div>
                      </section>

                      <section>
                        <h4 className="text-sm font-bold mb-2 flex items-center gap-2">
                          <div className="w-1.5 h-4 bg-primary rounded-full" />
                          输出结果 (Output)
                        </h4>
                        <div className="rounded-xl border border-border bg-card p-4 overflow-auto max-h-[500px]">
                          <pre className="text-xs font-mono leading-relaxed">
                            {JSON.stringify(selectedTool.result, null, 2)}
                          </pre>
                        </div>
                      </section>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>

          {/* Footer Actions */}
          <div className="p-4 border-t border-border bg-card/50 flex justify-end gap-3">
            <Button variant="outline" size="sm" className="rounded-lg" onClick={() => setShowEditModal(true)}>
              <Edit3 className="w-4 h-4 mr-2" />
              编辑数据
            </Button>
            <Button size="sm" className="rounded-lg" onClick={() => {
              const data = JSON.stringify(selectedTool.result, null, 2);
              navigator.clipboard.writeText(data);
            }}>
              <Copy className="w-4 h-4 mr-2" />
              复制结果
            </Button>
          </div>

          <LightboxListener />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ToolResultView({ toolName, result }: { toolName: string; result: any }) {
  if (toolName === 'html' || (typeof result === 'string' && result.includes('<!DOCTYPE html>')) || result?.html) {
    const htmlContent = typeof result === 'string' ? result : result.html;
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold flex items-center gap-2">
            <div className="w-1.5 h-4 bg-primary rounded-full" />
            渲染预览
          </h4>
          <div className="flex gap-2">
             <Badge variant="secondary">HTML5</Badge>
             <Badge variant="secondary">Responsive</Badge>
          </div>
        </div>
        <div className="aspect-video w-full rounded-2xl border border-border bg-white overflow-hidden shadow-lg">
          <iframe
            srcDoc={htmlContent}
            className="w-full h-full border-0"
            sandbox="allow-same-origin allow-scripts"
            title="Result Preview"
          />
        </div>
      </div>
    );
  }

  if (toolName === 'search_images') {
    return <ImageSearchResult result={result} />;
  }

  if (toolName === 'web_search') {
    return <WebSearchResult result={result} />;
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
          <Info className="w-5 h-5 text-muted-foreground" />
        </div>
        <div>
          <h4 className="font-bold text-foreground">执行结果</h4>
          <p className="text-xs text-muted-foreground">结构化数据展示</p>
        </div>
      </div>
      <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
        <pre className="text-sm font-mono leading-relaxed overflow-auto max-h-[500px]">
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>
    </div>
  );
}

function ImageSearchResult({ result }: { result: any[] }) {
  if (!Array.isArray(result)) return null;
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-bold flex items-center gap-2">
        <div className="w-1.5 h-4 bg-primary rounded-full" />
        找到 {result.length} 张图片
      </h4>
      <div className="grid grid-cols-2 gap-4">
        {result.slice(0, 12).map((img, idx) => (
          <div key={idx} className="group relative rounded-xl border border-border overflow-hidden bg-card shadow-sm hover:shadow-md transition-all">
            <div className="aspect-video overflow-hidden bg-muted">
              <img src={img.thumbnail || img.url} alt={img.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-3 bg-card/80 backdrop-blur-sm border-t border-border flex items-center justify-between">
              <span className="text-xs font-medium truncate flex-1 mr-2">{img.title || `Image ${idx+1}`}</span>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md">
                  <ZoomIn className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md">
                  <Download className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WebSearchResult({ result }: { result: any[] }) {
  if (!Array.isArray(result)) return null;
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-bold flex items-center gap-2">
        <div className="w-1.5 h-4 bg-primary rounded-full" />
        找到 {result.length} 个搜索结果
      </h4>
      <div className="space-y-3">
        {result.map((item, idx) => (
          <div key={idx} className="p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-all group shadow-sm">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <a href={item.url} target="_blank" rel="noreferrer" className="text-sm font-bold text-foreground hover:text-primary transition-colors line-clamp-1">
                  {item.title}
                </a>
                <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                  {item.snippet}
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {item.url ? new URL(item.url).hostname : ''}
                  </span>
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] rounded-md">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    访问
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const configs: Record<string, any> = {
    pending: { label: '等待中', color: 'text-muted-foreground' },
    running: { label: '正在执行', color: 'text-primary' },
    success: { label: '执行成功', color: 'text-green-500' },
    failed: { label: '执行失败', color: 'text-destructive' },
  };
  const config = configs[status || 'pending'] || configs.pending;
  return <span className={cn('font-bold uppercase tracking-tighter', config.color)}>{config.label}</span>;
}

function getToolLabel(name?: string): string {
  return TOOL_LABELS[name || ''] || name || '工具详情';
}
