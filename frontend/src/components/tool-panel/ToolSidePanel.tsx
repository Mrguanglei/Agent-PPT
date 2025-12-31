'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, CheckCircle, XCircle, Loader2, Code, FileText, Zap, Play, Pause, AlertCircle, Info, Download, ExternalLink, Copy, Image as ImageIcon, ZoomIn, Star, Edit3, Share2 } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'code' | 'ppt'>('ppt');
  const [showRaw, setShowRaw] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editValue, setEditValue] = useState<string>('');
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 0);

  // panel design width (matches content max-w-4xl which is 56rem = 896px)
  const CONTENT_PX = 56 * 16; // 56rem -> 896px
  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const selectedTool = toolCalls.find((tc) => tc.index === selectedIndex);

  return (
    <AnimatePresence>
      {isOpen && selectedTool && (
        <motion.div
          initial={{ x: '100%', opacity: 0, scale: 0.95 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          exit={{ x: '100%', opacity: 0, scale: 0.95 }}
          transition={{
            type: 'spring',
            stiffness: 320,
            damping: 35,
            mass: 0.8,
            opacity: { duration: 0.15 }
          }}
          style={
            windowWidth > CONTENT_PX
              ? { width: `${CONTENT_PX}px`, right: `calc((100% - ${CONTENT_PX}px) / 2)` }
              : { width: '100%', right: 0 }
          }
          className="fixed top-0 h-full z-50 tool-panel tool-panel-enter flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="tool-panel-header sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-base truncate">
                      {getToolLabel(selectedTool?.name)}
                    </h3>
                    <div className="flex items-center gap-3 mt-2">
                      <StatusBadge status={selectedTool?.status} />
                      {selectedTool?.executionTime !== undefined && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="font-medium">{selectedTool.executionTime.toFixed(2)}s</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-lg hover:bg-muted/10"
                  onClick={() => {
                    const key = selectedTool?.id || `${selectedTool?.name}-${selectedTool?.index}`;
                    const favs = JSON.parse(localStorage.getItem('tool_favorites') || '{}');
                    if (favs[key]) {
                      delete favs[key];
                      localStorage.setItem('tool_favorites', JSON.stringify(favs));
                    } else {
                      favs[key] = { name: selectedTool?.name, time: Date.now() };
                      localStorage.setItem('tool_favorites', JSON.stringify(favs));
                    }
                    // visual toggle via small pulse
                    // no state here to persist in store
                  }}
                  title="收藏"
                >
                  <Star className="w-4 h-4 text-muted-foreground" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-lg hover:bg-muted/10"
                  onClick={() => {
                    try {
                      const dataStr = typeof selectedTool?.result === 'string' ? selectedTool.result : JSON.stringify(selectedTool?.result || {}, null, 2);
                      const blob = new Blob([dataStr], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${getToolLabel(selectedTool?.name || 'result')}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    } catch (e) {
                      console.error('Download failed', e);
                    }
                  }}
                  title="下载"
                >
                  <Download className="w-4 h-4 text-muted-foreground" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-lg hover:bg-muted/10"
                  onClick={() => {
                    // open edit modal
                    const val = typeof selectedTool?.result === 'string' ? selectedTool.result : JSON.stringify(selectedTool?.result || {}, null, 2);
                    setShowEditModal(true);
                    setEditValue(val);
                  }}
                  title="编辑"
                >
                  <Edit3 className="w-4 h-4 text-muted-foreground" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-lg hover:bg-muted/10"
                  onClick={() => setShowShareModal(true)}
                  title="分享"
                >
                  <Share2 className="w-4 h-4 text-muted-foreground" />
                </Button>

                <Button variant="ghost" size="icon" onClick={closePanel} className="h-9 w-9 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-all duration-200">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1 scrollbar-modern">
          <div className="tool-panel-content flex flex-col min-h-full">
              {/* Share modal */}
              {showShareModal && (
                <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50">
                  <div className="bg-card p-6 rounded-lg w-[640px] max-w-full">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-semibold">分享工具结果</h4>
                      <button className="p-2" onClick={() => setShowShareModal(false)}>关闭</button>
                    </div>
                    <div className="text-sm mb-2">复制下面的分享内容或直接复制链接：</div>
                    <textarea readOnly className="w-full h-40 p-3 border border-border rounded mb-4" value={selectedTool ? JSON.stringify({ name: selectedTool.name, result: selectedTool.result }, null, 2) : ''} />
                    <div className="flex justify-end gap-2">
                      <button className="btn-modern btn-modern-primary" onClick={() => { navigator.clipboard.writeText(JSON.stringify({ name: selectedTool?.name, result: selectedTool?.result })); }}>
                        复制
                      </button>
                      <button className="btn-modern" onClick={() => setShowShareModal(false)}>完成</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Edit modal */}
              {showEditModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
                  <div className="bg-card p-6 rounded-lg w-[720px] max-w-full">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-semibold">编辑工具结果</h4>
                      <button className="p-2" onClick={() => setShowEditModal(false)}>关闭</button>
                    </div>
                    <textarea value={editValue} onChange={(e) => setEditValue(e.target.value)} className="w-full h-64 p-3 border border-border rounded mb-4" />
                    <div className="flex justify-end gap-2">
                      <button className="btn-modern btn-modern-primary" onClick={() => {
                        // save edited result back to store
                        try {
                          const parsed = (() => {
                            try { return JSON.parse(editValue); } catch { return editValue; }
                          })();
                          if (selectedTool) {
                            updateToolCall(selectedTool.index, { result: parsed });
                          }
                        } catch (e) {
                          console.error('Save failed', e);
                        }
                        setShowEditModal(false);
                      }}>保存</button>
                      <button className="btn-modern" onClick={() => setShowEditModal(false)}>取消</button>
                    </div>
                  </div>
                </div>
              )}
              {/* Status Overview */}
              <div className="tool-panel-section">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="tool-panel-section-header">执行状态</h4>
                  <Badge variant="outline" className="text-xs px-2.5 py-1 bg-card/50 border-border/50">
                    工具 #{selectedTool.index + 1}
                  </Badge>
                </div>
                <div className="card-modern p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <StatusIcon status={selectedTool.status} />
                      <div className="flex-1">
                        <p className="text-base font-semibold capitalize mb-1">
                          {selectedTool.status === 'running' ? '执行中' :
                           selectedTool.status === 'success' ? '完成' :
                           selectedTool.status === 'failed' ? '失败' : '等待中'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {selectedTool.status === 'running' ? '正在处理您的请求...' :
                           selectedTool.status === 'success' ? '工具执行成功' :
                           selectedTool.status === 'failed' ? '执行过程中出现错误' : '等待执行'}
                        </p>
                      </div>
                    </div>
                    {selectedTool.executionTime && (
                      <div className="text-right bg-muted/30 px-3 py-2 rounded-lg">
                        <p className="text-lg font-bold text-foreground">{selectedTool.executionTime.toFixed(2)}s</p>
                        <p className="text-xs text-muted-foreground font-medium">执行时间</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Parameters moved below as collapsible raw view */}

              {/* Result - PPT 生成工具特殊处理 */}
              {selectedTool.name === 'html' && selectedTool.result ? (
                <div className="tool-panel-section">
                  <h4 className="tool-panel-section-header">生成结果</h4>
                  <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'code' | 'ppt')} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-5 h-10">
                      <TabsTrigger value="ppt" className="gap-2 text-sm font-medium">
                        <FileText className="w-4 h-4" />
                        预览
                      </TabsTrigger>
                      <TabsTrigger value="code" className="gap-2 text-sm font-medium">
                        <Code className="w-4 h-4" />
                        源码
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="ppt" className="mt-0 flex-1 min-h-0">
                      <div className="card-modern p-4 flex flex-col h-full min-h-0">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-success/10 border border-success/20">
                            <FileText className="w-4 h-4 text-success" />
                          </div>
                          <span className="text-sm font-semibold text-foreground">PPT 预览</span>
                        </div>
                        <div className="flex-1 overflow-hidden min-h-0">
                          {renderPPTPreview(selectedTool.result)}
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="code" className="mt-0 flex-1 min-h-0">
                      <div className="card-modern p-4 flex flex-col h-full min-h-0">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                            <Code className="w-4 h-4 text-primary" />
                          </div>
                          <span className="text-sm font-semibold text-foreground">HTML 源码</span>
                        </div>
                        <div className="flex-1 overflow-auto min-h-0">
                          <pre className="text-sm text-foreground overflow-auto max-h-full bg-muted/30 border border-border/50 p-4 rounded-xl font-mono leading-relaxed">
                            {typeof selectedTool.result === 'string'
                              ? selectedTool.result
                              : JSON.stringify(selectedTool.result, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              ) : selectedTool.result ? (
                <div className="tool-panel-section">
                  <h4 className="tool-panel-section-header">执行结果</h4>
                  <ToolResultView toolName={selectedTool.name} result={selectedTool.result} />
                </div>
              ) : null}

              {/* Error */}
              {selectedTool.error && (
                <div className="tool-panel-section">
                  <h4 className="tool-panel-section-header">错误信息</h4>
                  <div className="card-modern p-5 border-destructive/30 bg-gradient-to-r from-destructive/5 to-destructive/10">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-destructive/20 border border-destructive/30">
                        <AlertCircle className="w-5 h-5 text-destructive" />
                      </div>
                      <div className="flex-1">
                        <p className="text-base font-semibold text-destructive mb-2">执行失败</p>
                        <p className="text-sm text-destructive/90 leading-relaxed">{selectedTool.error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Collapsible raw / params view */}
              <div className="tool-panel-section">
                <div className="flex items-center justify-between">
                  <h4 className="tool-panel-section-header">原始数据</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowRaw((s) => !s)}
                    className="text-xs"
                  >
                    {showRaw ? '隐藏' : '显示'}
                  </Button>
                </div>
                {showRaw && (
                  <div className="card-modern p-4 mt-2">
                    <div className="text-xs text-muted-foreground mb-2">输入参数</div>
                    <pre className="text-xs text-foreground overflow-auto bg-muted/30 p-3 rounded-lg max-h-[220px]">
                      {selectedTool.params ? (typeof selectedTool.params === 'string' ? selectedTool.params : JSON.stringify(selectedTool.params, null, 2)) : '无'}
                    </pre>

                    <div className="text-xs text-muted-foreground mt-3 mb-2">原始结果</div>
                    <pre className="text-xs text-foreground overflow-auto bg-muted/30 p-3 rounded-lg max-h-[320px]">
                      {selectedTool.result ? (typeof selectedTool.result === 'string' ? selectedTool.result : JSON.stringify(selectedTool.result, null, 2)) : '无'}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
            <LightboxListener />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function renderPPTPreview(result: any) {
  // 如果结果是 HTML，渲染为 iframe
  if (typeof result === 'string' && result.includes('<!DOCTYPE html>')) {
    return (
      <div className="w-full">
        <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card/50 shadow-sm h-full min-h-0">
          <iframe
            srcDoc={result}
            className="w-full h-full border-0 min-h-0"
            sandbox="allow-same-origin allow-scripts"
            title="PPT Preview"
          />
          <div className="absolute inset-0 pointer-events-none rounded-xl ring-1 ring-white/10"></div>
        </div>
      </div>
    );
  }

  // 如果结果是对象，包含 HTML
  if (result?.html) {
    return (
      <div className="w-full">
        <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card/50 shadow-sm h-full min-h-0">
          <iframe
            srcDoc={result.html}
            className="w-full h-full border-0 min-h-0"
            sandbox="allow-same-origin allow-scripts"
            title="PPT Preview"
          />
          <div className="absolute inset-0 pointer-events-none rounded-xl ring-1 ring-white/10"></div>
        </div>
      </div>
    );
  }

  // 其他情况显示 JSON
  return (
    <div className="bg-muted/30 border border-border/50 p-4 rounded-xl">
      <pre className="text-sm text-muted-foreground font-mono leading-relaxed">
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const configs: Record<string, any> = {
    pending: {
      icon: Clock,
      label: '等待中',
      className: 'status-indicator status-pending',
      bgColor: 'bg-muted/60',
      textColor: 'text-muted-foreground',
      borderColor: 'border-muted-foreground/20'
    },
    running: {
      icon: Loader2,
      label: '运行中',
      className: 'status-indicator status-running',
      bgColor: 'bg-info/10',
      textColor: 'text-info',
      borderColor: 'border-info/30',
      glow: true
    },
    success: {
      icon: CheckCircle,
      label: '成功',
      className: 'status-indicator status-success',
      bgColor: 'bg-success/10',
      textColor: 'text-success',
      borderColor: 'border-success/30'
    },
    failed: {
      icon: XCircle,
      label: '失败',
      className: 'status-indicator status-failed',
      bgColor: 'bg-destructive/10',
      textColor: 'text-destructive',
      borderColor: 'border-destructive/30'
    },
  };

  const config = configs[status || 'pending'] || configs.pending;
  const Icon = config.icon;

  return (
    <div className={cn(config.className, config.bgColor, config.textColor, 'border', config.borderColor)}>
      <Icon className={cn('w-3.5 h-3.5', config.glow && 'animate-pulse')} />
      <span className="font-medium">{config.label}</span>
    </div>
  );
}

function StatusIcon({ status }: { status?: string }) {
  const configs: Record<string, any> = {
    pending: {
      icon: Clock,
      color: 'text-muted-foreground',
      bg: 'bg-gradient-to-br from-muted/60 to-muted/40',
      border: 'border-muted-foreground/20'
    },
    running: {
      icon: Play,
      color: 'text-info',
      bg: 'bg-gradient-to-br from-info/15 to-info/10',
      border: 'border-info/30',
      glow: true
    },
    success: {
      icon: CheckCircle,
      color: 'text-success',
      bg: 'bg-gradient-to-br from-success/15 to-success/10',
      border: 'border-success/30'
    },
    failed: {
      icon: XCircle,
      color: 'text-destructive',
      bg: 'bg-gradient-to-br from-destructive/15 to-destructive/10',
      border: 'border-destructive/30'
    },
  };

  const config = configs[status || 'pending'] || configs.pending;
  const Icon = config.icon;

  return (
    <div className={cn(
      'p-3 rounded-xl border shadow-sm',
      config.bg,
      config.border,
      config.glow && 'shadow-info/20 animate-pulse'
    )}>
      <Icon className={cn('w-5 h-5', config.color)} />
    </div>
  );
}

function getToolLabel(name?: string): string {
  return TOOL_LABELS[name || ''] || name || 'Tool Details';
}

function ToolResultView({ toolName, result }: { toolName: string; result: any }) {
  if (toolName === 'search_images') {
    return <ImageSearchResult result={result} />;
  }

  if (toolName === 'web_search') {
    return <WebSearchResult result={result} />;
  }

  return (
    <div className="card-modern p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-muted/50 border border-border/50">
          <Info className="w-4 h-4 text-muted-foreground" />
        </div>
        <span className="text-sm font-semibold text-muted-foreground">执行结果</span>
      </div>
      <pre className="text-sm text-foreground overflow-auto bg-muted/30 border border-border/50 p-4 rounded-xl font-mono leading-relaxed max-h-[400px]">
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
}

function ImageSearchResult({ result }: { result: any[] }) {
  if (!Array.isArray(result)) return null;

  return (
    <div className="card-modern p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
          <FileText className="w-4 h-4 text-primary" />
        </div>
        <span className="text-sm font-semibold text-foreground">
          找到 {result.length} 张图片
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {result.slice(0, 12).map((img, idx) => (
          <div
            key={idx}
            className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/50 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="aspect-video overflow-hidden">
              <img
                src={img.thumbnail || img.url}
                alt={img.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onClick={() => {
                  // open lightbox handled below via dataset
                  const ev = new CustomEvent('openLightbox', { detail: { src: img.url || img.thumbnail } });
                  window.dispatchEvent(ev);
                }}
              />
            </div>
            <div className="p-3 flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mr-2">
                {img.title || `图片 ${idx + 1}`}
              </p>
              <div className="flex items-center gap-2">
                <button
                  className="p-1 rounded-md hover:bg-muted/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    const a = document.createElement('a');
                    a.href = img.url || img.thumbnail;
                    a.download = `${img.title ? img.title.replace(/\s+/g, '_') : 'image'}.jpg`;
                    a.target = '_blank';
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                  }}
                  title="下载图片"
                >
                  <Download className="w-4 h-4 text-muted-foreground" />
                </button>
                <button
                  className="p-1 rounded-md hover:bg-muted/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    const ev = new CustomEvent('openLightbox', { detail: { src: img.url || img.thumbnail } });
                    window.dispatchEvent(ev);
                  }}
                  title="查看大图"
                >
                  <ZoomIn className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {result.length > 12 && (
        <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-border/50">
          <p className="text-xs text-muted-foreground text-center">
            仅显示前 12 张图片，还有 {result.length - 12} 张未显示
          </p>
        </div>
      )}
      {/* Lightbox listener */}
      <LightboxListener />
    </div>
  );
}

function WebSearchResult({ result }: { result: any[] }) {
  if (!Array.isArray(result)) return null;

  return (
    <div className="card-modern p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-info/10 border border-info/20">
          <FileText className="w-4 h-4 text-info" />
        </div>
        <span className="text-sm font-semibold text-foreground">
          找到 {result.length} 个搜索结果
        </span>
      </div>
      <div className="space-y-3">
        {result.map((item, idx) => {
          let host = '';
          try {
            host = item.url ? new URL(item.url).hostname : '';
          } catch (e) {
            host = '';
          }
          return (
            <div
              key={idx}
              className="p-4 rounded-xl border border-border/50 bg-card/30 hover:bg-card/50 hover:border-primary/30 transition-all duration-200 group cursor-pointer shadow-sm hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">{idx + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-relaxed">
                        <a href={item.url} target="_blank" rel="noreferrer" className="inline-block">
                          {item.title}
                        </a>
                      </h4>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-3 leading-relaxed">
                        {item.snippet}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {item.url && (
                        <>
                          <div className="text-xs text-muted-foreground font-mono truncate">{host}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <button
                              className="p-1 rounded-md hover:bg-muted/10"
                              onClick={() => window.open(item.url, '_blank')}
                              title="打开链接"
                            >
                              <ExternalLink className="w-4 h-4 text-muted-foreground" />
                            </button>
                            <button
                              className="p-1 rounded-md hover:bg-muted/10"
                              onClick={() => {
                                try {
                                  navigator.clipboard.writeText(item.url);
                                } catch (e) {
                                  console.error('copy fail', e);
                                }
                              }}
                              title="复制链接"
                            >
                              <Copy className="w-4 h-4 text-muted-foreground" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
