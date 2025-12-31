'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, CheckCircle, XCircle, Loader2, Code, FileText, Zap, Play, Pause, AlertCircle, Info } from 'lucide-react';
import { useToolPanelStore } from '@/stores/toolPanelStore';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TOOL_LABELS } from '@/lib/constants';

export function ToolSidePanel() {
  const { isOpen, closePanel, selectedIndex, toolCalls } = useToolPanelStore();
  const [activeTab, setActiveTab] = useState<'code' | 'ppt'>('ppt');
  const selectedTool = toolCalls.find((tc) => tc.index === selectedIndex);

  return (
    <AnimatePresence>
      {isOpen && selectedTool && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
            opacity: { duration: 0.2 }
          }}
          className="fixed right-0 top-0 h-full w-96 z-50 tool-panel shadow-modern-lg flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="tool-panel-header sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">
                      {getToolLabel(selectedTool?.name)}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusBadge status={selectedTool?.status} />
                      {selectedTool?.executionTime !== undefined && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{selectedTool.executionTime.toFixed(2)}s</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={closePanel}
                className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1 scrollbar-modern">
            <div className="tool-panel-content">
              {/* Status Overview */}
              <div className="tool-panel-section">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="tool-panel-section-header">执行状态</h4>
                  <Badge variant="outline" className="text-xs">
                    工具 #{selectedTool.index + 1}
                  </Badge>
                </div>
                <div className="card-modern p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <StatusIcon status={selectedTool.status} />
                      <div>
                        <p className="text-sm font-medium capitalize">
                          {selectedTool.status === 'running' ? '执行中' :
                           selectedTool.status === 'success' ? '完成' :
                           selectedTool.status === 'failed' ? '失败' : '等待中'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {selectedTool.status === 'running' ? '正在处理您的请求...' :
                           selectedTool.status === 'success' ? '工具执行成功' :
                           selectedTool.status === 'failed' ? '执行过程中出现错误' : '等待执行'}
                        </p>
                      </div>
                    </div>
                    {selectedTool.executionTime && (
                      <div className="text-right">
                        <p className="text-sm font-medium">{selectedTool.executionTime.toFixed(2)}s</p>
                        <p className="text-xs text-muted-foreground">执行时间</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Parameters */}
              {selectedTool.params && (
                <div className="tool-panel-section">
                  <h4 className="tool-panel-section-header">输入参数</h4>
                  <div className="card-modern p-4">
                    <pre className="text-xs text-foreground overflow-auto bg-muted/50 p-3 rounded-lg">
                      {JSON.stringify(selectedTool.params, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Result - PPT 生成工具特殊处理 */}
              {selectedTool.name === 'html' && selectedTool.result ? (
                <div className="tool-panel-section">
                  <h4 className="tool-panel-section-header">生成结果</h4>
                  <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'code' | 'ppt')} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="ppt" className="gap-2 text-xs">
                        <FileText className="w-3 h-3" />
                        预览
                      </TabsTrigger>
                      <TabsTrigger value="code" className="gap-2 text-xs">
                        <Code className="w-3 h-3" />
                        源码
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="ppt" className="mt-0">
                      <div className="card-modern p-4">
                        {renderPPTPreview(selectedTool.result)}
                      </div>
                    </TabsContent>
                    <TabsContent value="code" className="mt-0">
                      <div className="card-modern p-4">
                        <pre className="text-xs text-foreground overflow-auto max-h-[500px] bg-muted/50 p-3 rounded-lg">
                          {typeof selectedTool.result === 'string'
                            ? selectedTool.result
                            : JSON.stringify(selectedTool.result, null, 2)}
                        </pre>
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
                  <div className="card-modern p-4 border-destructive/50 bg-destructive/5">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-destructive mb-1">执行失败</p>
                        <p className="text-sm text-destructive/80">{selectedTool.error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
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
        <iframe
          srcDoc={result}
          className="w-full h-[500px] border-0 rounded-lg"
          sandbox="allow-same-origin allow-scripts"
          title="PPT Preview"
        />
      </div>
    );
  }

  // 如果结果是对象，包含 HTML
  if (result?.html) {
    return (
      <div className="w-full">
        <iframe
          srcDoc={result.html}
          className="w-full h-[500px] border-0 rounded-lg"
          sandbox="allow-same-origin allow-scripts"
          title="PPT Preview"
        />
      </div>
    );
  }

  // 其他情况显示 JSON
  return (
    <pre className="text-xs text-muted-foreground">
      {JSON.stringify(result, null, 2)}
    </pre>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const configs: Record<string, any> = {
    pending: {
      icon: Clock,
      label: '等待中',
      className: 'status-indicator status-pending',
      dotColor: 'bg-muted-foreground'
    },
    running: {
      icon: Loader2,
      label: '运行中',
      className: 'status-indicator status-running',
      dotColor: 'bg-info animate-pulse',
      spin: true
    },
    success: {
      icon: CheckCircle,
      label: '成功',
      className: 'status-indicator status-success',
      dotColor: 'bg-success'
    },
    failed: {
      icon: XCircle,
      label: '失败',
      className: 'status-indicator status-failed',
      dotColor: 'bg-destructive'
    },
  };

  const config = configs[status || 'pending'] || configs.pending;
  const Icon = config.icon;

  return (
    <div className={config.className}>
      <div className={cn('w-2 h-2 rounded-full', config.dotColor)} />
      <Icon className={cn('w-3 h-3', config.spin && 'animate-spin')} />
      <span>{config.label}</span>
    </div>
  );
}

function StatusIcon({ status }: { status?: string }) {
  const configs: Record<string, any> = {
    pending: { icon: Clock, color: 'text-muted-foreground', bg: 'bg-muted' },
    running: { icon: Play, color: 'text-info', bg: 'bg-info/10', pulse: true },
    success: { icon: CheckCircle, color: 'text-success', bg: 'bg-success/10' },
    failed: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
  };

  const config = configs[status || 'pending'] || configs.pending;
  const Icon = config.icon;

  return (
    <div className={cn('p-2 rounded-lg', config.bg, config.pulse && 'animate-pulse')}>
      <Icon className={cn('w-4 h-4', config.color)} />
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
    <div className="card-modern p-4">
      <div className="flex items-center gap-2 mb-3">
        <Info className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">原始数据</span>
      </div>
      <pre className="text-xs text-foreground overflow-auto bg-muted/50 p-3 rounded-lg max-h-[400px]">
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
}

function ImageSearchResult({ result }: { result: any[] }) {
  if (!Array.isArray(result)) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">
          找到 {result.length} 张图片
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {result.slice(0, 6).map((img, idx) => (
          <div
            key={idx}
            className="card-modern overflow-hidden group cursor-pointer"
          >
            <div className="aspect-video overflow-hidden">
              <img
                src={img.thumbnail || img.url}
                alt={img.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            </div>
            <div className="p-3">
              <p className="text-xs text-muted-foreground line-clamp-2">
                {img.title || `图片 ${idx + 1}`}
              </p>
            </div>
          </div>
        ))}
      </div>
      {result.length > 6 && (
        <p className="text-xs text-muted-foreground text-center">
          仅显示前 6 张图片
        </p>
      )}
    </div>
  );
}

function WebSearchResult({ result }: { result: any[] }) {
  if (!Array.isArray(result)) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">
          找到 {result.length} 个搜索结果
        </span>
      </div>
      <div className="space-y-3">
        {result.map((item, idx) => (
          <div
            key={idx}
            className="card-modern p-4 hover:border-primary/30 transition-all duration-200 group cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-medium text-primary">{idx + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {item.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {item.snippet}
                </p>
                {item.url && (
                  <p className="text-xs text-muted-foreground mt-2 truncate">
                    {item.url}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
