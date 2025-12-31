'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Code, Loader2, ExternalLink } from 'lucide-react';
import { useToolPanelStore } from '@/stores/toolPanelStore';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { TOOL_LABELS } from '@/lib/constants';

export function ToolSidePanel() {
  const { isOpen, closePanel, selectedIndex, toolCalls } = useToolPanelStore((state) => ({
    isOpen: state.isOpen,
    closePanel: state.closePanel,
    selectedIndex: state.selectedIndex,
    toolCalls: state.toolCalls,
  }));
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const selectedTool = toolCalls.find((tc) => tc.index === selectedIndex);

  if (!isOpen || !selectedTool) return null;

  const toolName = TOOL_LABELS[selectedTool.name] || selectedTool.name;
  const isHtmlTool = selectedTool.name === 'html';
  const hasResult = selectedTool.result !== undefined && selectedTool.result !== null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: 500, opacity: 1 }}
        exit={{ width: 0, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed right-0 top-0 h-full z-40 bg-background border-l border-border flex flex-col overflow-hidden shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              selectedTool.status === 'running' ? "bg-blue-500/20 animate-pulse" :
              selectedTool.status === 'success' ? "bg-green-500/20" :
              selectedTool.status === 'failed' ? "bg-red-500/20" :
              "bg-gray-500/20"
            )}>
              {selectedTool.status === 'running' && <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />}
              {selectedTool.status === 'success' && <FileText className="w-5 h-5 text-green-500" />}
              {selectedTool.status === 'failed' && <X className="w-5 h-5 text-red-500" />}
              {selectedTool.status === 'pending' && <Loader2 className="w-5 h-5 text-gray-500" />}
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">{toolName}</h3>
              {selectedTool.executionTime !== undefined && (
                <p className="text-xs text-muted-foreground">耗时: {selectedTool.executionTime.toFixed(2)}s</p>
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
            {/* Loading State */}
            {selectedTool.status === 'running' && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
                <p className="text-sm text-muted-foreground">正在执行...</p>
              </div>
            )}

            {/* Error State */}
            {selectedTool.status === 'failed' && selectedTool.error && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                <p className="text-sm text-destructive">{selectedTool.error}</p>
              </div>
            )}

            {/* Result Display */}
            {hasResult && selectedTool.status !== 'running' && (
              <div className="space-y-4">
                {/* HTML Tool - Show Tabs */}
                {isHtmlTool ? (
                  <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'preview' | 'code')}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="preview" className="gap-2">
                        <FileText className="w-4 h-4" />
                        预览
                      </TabsTrigger>
                      <TabsTrigger value="code" className="gap-2">
                        <Code className="w-4 h-4" />
                        代码
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="preview" className="mt-4">
                      <div className="border border-border rounded-lg overflow-hidden bg-card">
                        {renderHtmlPreview(selectedTool.result)}
                      </div>
                    </TabsContent>

                    <TabsContent value="code" className="mt-4">
                      <pre className="p-4 rounded-lg bg-muted text-xs text-foreground overflow-auto max-h-[600px] border border-border">
                        {typeof selectedTool.result === 'string'
                          ? selectedTool.result
                          : JSON.stringify(selectedTool.result, null, 2)}
                      </pre>
                    </TabsContent>
                  </Tabs>
                ) : (
                  /* Other Tools - Show formatted result */
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-foreground">执行结果</h4>
                    {renderToolResult(selectedTool.name, selectedTool.result)}
                  </div>
                )}
              </div>
            )}

            {/* No Result */}
            {!hasResult && selectedTool.status !== 'running' && !selectedTool.error && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="w-12 h-12 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">暂无结果</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </motion.div>
    </AnimatePresence>
  );
}

function renderHtmlPreview(result: any) {
  // If result is HTML string, render in iframe
  if (typeof result === 'string' && result.includes('<!DOCTYPE html>')) {
    return (
      <iframe
        srcDoc={result}
        className="w-full h-[600px] border-0"
        sandbox="allow-same-origin allow-scripts"
        title="Preview"
      />
    );
  }

  // If result is object with HTML property
  if (result?.html) {
    return (
      <iframe
        srcDoc={result.html}
        className="w-full h-[600px] border-0"
        sandbox="allow-same-origin allow-scripts"
        title="Preview"
      />
    );
  }

  // Fallback
  return (
    <pre className="p-4 text-xs text-muted-foreground overflow-auto">
      {JSON.stringify(result, null, 2)}
    </pre>
  );
}

function renderToolResult(toolName: string, result: any) {
  // Web search results - Format as beautiful cards
  if (toolName === 'web_search' && Array.isArray(result)) {
    return (
      <div className="space-y-3">
        {result.map((item: any, idx: number) => (
          <a
            key={idx}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 rounded-lg bg-card border border-border hover:border-blue-400 hover:shadow-md transition-all duration-200 group"
          >
            <div className="flex items-start gap-3">
              {/* Site Icon */}
              {item.siteIcon && (
                <img
                  src={item.siteIcon}
                  alt=""
                  className="w-5 h-5 rounded flex-shrink-0 mt-0.5"
                />
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Title */}
                <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:underline line-clamp-2 mb-1">
                  {item.title}
                </h4>

                {/* Site Name */}
                {item.siteName && (
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <span>{item.siteName}</span>
                    {item.displayUrl && (
                      <>
                        <span>•</span>
                        <span className="text-[10px] truncate">{item.displayUrl}</span>
                      </>
                    )}
                  </p>
                )}

                {/* Snippet */}
                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                  {item.snippet}
                </p>

                {/* Date */}
                {item.dateLastCrawled && (
                  <p className="text-[10px] text-muted-foreground/60 mt-2">
                    {new Date(item.dateLastCrawled).toLocaleDateString('zh-CN')}
                  </p>
                )}
              </div>

              {/* External Link Icon */}
              <ExternalLink className="w-4 h-4 text-muted-foreground/40 group-hover:text-blue-400 flex-shrink-0 mt-0.5 transition-colors" />
            </div>
          </a>
        ))}
      </div>
    );
  }

  // Image search results
  if (toolName === 'search_images' && Array.isArray(result)) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {result.slice(0, 6).map((img: any, idx: number) => (
          <a
            key={idx}
            href={img.url}
            target="_blank"
            rel="noopener noreferrer"
            className="aspect-video rounded-lg bg-card border border-border overflow-hidden hover:border-primary/50 transition-colors"
          >
            <img
              src={img.thumbnail || img.url}
              alt={img.title}
              className="w-full h-full object-cover"
            />
          </a>
        ))}
      </div>
    );
  }

  // Visit page result
  if (toolName === 'visit_page' && result?.content) {
    return (
      <div className="p-4 rounded-lg bg-card border border-border">
        <p className="text-xs text-foreground whitespace-pre-wrap break-words">
          {result.content}
        </p>
      </div>
    );
  }

  // Think tool
  if (toolName === 'think') {
    return (
      <div className="p-4 rounded-lg bg-blue-50/50 border border-blue-200">
        <p className="text-sm text-foreground whitespace-pre-wrap">
          {result}
        </p>
      </div>
    );
  }

  // Default: show JSON
  return (
    <pre className="p-4 rounded-lg bg-card text-xs text-foreground overflow-auto border border-border max-h-[600px]">
      {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
    </pre>
  );
}
