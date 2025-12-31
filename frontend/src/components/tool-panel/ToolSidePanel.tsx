'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, CheckCircle, XCircle, Loader2, Code, FileText } from 'lucide-react';
import { useToolPanelStore } from '@/stores/toolPanelStore';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 400, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="fixed right-0 top-0 h-full z-40 bg-secondary border-l border-border flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <StatusBadge status={selectedTool?.status} />
              <div>
                <h3 className="font-semibold text-foreground">
                  {getToolLabel(selectedTool?.name)}
                </h3>
                {selectedTool?.executionTime !== undefined && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{selectedTool.executionTime.toFixed(2)}s</span>
                  </div>
                )}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={closePanel}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1">
            <div className="p-4">
              {/* Params */}
              {selectedTool.params && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Parameters</h4>
                  <pre className="p-3 rounded-lg bg-card text-xs text-foreground overflow-auto">
                    {JSON.stringify(selectedTool.params, null, 2)}
                  </pre>
                </div>
              )}

              {/* Result - PPT 生成工具特殊处理 */}
              {selectedTool.name === 'html' && selectedTool.result ? (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Generated Slide</h4>
                  <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'code' | 'ppt')}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="ppt" className="gap-2">
                        <FileText className="w-4 h-4" />
                        PPT
                      </TabsTrigger>
                      <TabsTrigger value="code" className="gap-2">
                        <Code className="w-4 h-4" />
                        代码
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="ppt" className="mt-4">
                      <div className="p-4 rounded-lg bg-card border border-border">
                        {renderPPTPreview(selectedTool.result)}
                      </div>
                    </TabsContent>
                    <TabsContent value="code" className="mt-4">
                      <pre className="p-3 rounded-lg bg-card text-xs text-foreground overflow-auto max-h-[600px]">
                        {typeof selectedTool.result === 'string'
                          ? selectedTool.result
                          : JSON.stringify(selectedTool.result, null, 2)}
                      </pre>
                    </TabsContent>
                  </Tabs>
                </div>
              ) : selectedTool.result ? (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Result</h4>
                  <ToolResultView toolName={selectedTool.name} result={selectedTool.result} />
                </div>
              ) : null}

              {/* Error */}
              {selectedTool.error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                  <p className="text-sm text-destructive">{selectedTool.error}</p>
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
    pending: { icon: Loader2, color: 'text-muted-foreground', bg: 'bg-muted' },
    running: { icon: Loader2, color: 'text-primary', bg: 'bg-primary/20', spin: true },
    success: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/20' },
    failed: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/20' },
  };

  const config = configs[status || 'pending'] || configs.pending;
  const Icon = config.icon;

  return (
    <div className={cn('p-2 rounded-lg', config.bg)}>
      <Icon className={cn('w-5 h-5', config.color, config.spin && 'animate-spin')} />
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
    <pre className="p-3 rounded-lg bg-card text-xs text-foreground overflow-auto">
      {JSON.stringify(result, null, 2)}
    </pre>
  );
}

function ImageSearchResult({ result }: { result: any[] }) {
  if (!Array.isArray(result)) return null;

  return (
    <div className="grid grid-cols-2 gap-2">
      {result.slice(0, 6).map((img, idx) => (
        <div
          key={idx}
          className="aspect-video rounded-lg bg-card border border-border overflow-hidden"
        >
          <img
            src={img.thumbnail || img.url}
            alt={img.title}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
    </div>
  );
}

function WebSearchResult({ result }: { result: any[] }) {
  if (!Array.isArray(result)) return null;

  return (
    <div className="space-y-2">
      {result.map((item, idx) => (
        <div
          key={idx}
          className="p-3 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
        >
          <p className="text-sm font-medium text-foreground">{item.title}</p>
          <p className="text-xs text-muted-foreground line-clamp-2">{item.snippet}</p>
        </div>
      ))}
    </div>
  );
}
