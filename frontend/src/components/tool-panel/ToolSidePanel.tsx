'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Code, Loader2, ExternalLink, Search, Image, Globe, Brain, CheckCircle, AlertTriangle, Clock, Copy } from 'lucide-react';
import { useToolPanelStore } from '@/stores/toolPanelStore';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { TOOL_LABELS } from '@/lib/constants';

export function ToolSidePanel() {
  const isOpen = useToolPanelStore((state) => state.isOpen);
  const closePanel = useToolPanelStore((state) => state.closePanel);
  const selectedIndex = useToolPanelStore((state) => state.selectedIndex);
  const toolCalls = useToolPanelStore((state) => state.toolCalls);
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');

  // 使用 useMemo 避免 find 在每次渲染时执行
  const selectedTool = useMemo(
    () => toolCalls.find((tc) => tc.index === selectedIndex),
    [toolCalls, selectedIndex]
  );

  if (!isOpen || !selectedTool) return null;

  const toolName = TOOL_LABELS[selectedTool.name] || selectedTool.name;
  const isHtmlTool = selectedTool.name === 'html';
  const hasResult = selectedTool.result !== undefined && selectedTool.result !== null;

  // Get tool icon and colors based on tool type
  const getToolIconAndStyle = (toolName: string, status: string) => {
    const baseStyle = {
      icon: FileText,
      bgColor: "bg-gray-500/20",
      iconColor: "text-gray-500",
      borderColor: "border-gray-200"
    };

    switch (toolName) {
      case 'web_search':
        return {
          icon: Search,
          bgColor: status === 'running' ? "bg-blue-500/20 animate-pulse" :
                   status === 'success' ? "bg-green-500/20" :
                   status === 'failed' ? "bg-red-500/20" : "bg-blue-500/20",
          iconColor: status === 'running' ? "text-blue-500" :
                     status === 'success' ? "text-green-500" :
                     status === 'failed' ? "text-red-500" : "text-blue-500",
          borderColor: "border-blue-200"
        };
      case 'search_images':
        return {
          icon: Image,
          bgColor: status === 'running' ? "bg-purple-500/20 animate-pulse" :
                   status === 'success' ? "bg-pink-500/20" :
                   status === 'failed' ? "bg-red-500/20" : "bg-purple-500/20",
          iconColor: status === 'running' ? "text-purple-500" :
                     status === 'success' ? "text-pink-500" :
                     status === 'failed' ? "text-red-500" : "text-purple-500",
          borderColor: "border-purple-200"
        };
      case 'visit_page':
        return {
          icon: Globe,
          bgColor: status === 'running' ? "bg-cyan-500/20 animate-pulse" :
                   status === 'success' ? "bg-teal-500/20" :
                   status === 'failed' ? "bg-red-500/20" : "bg-cyan-500/20",
          iconColor: status === 'running' ? "text-cyan-500" :
                     status === 'success' ? "text-teal-500" :
                     status === 'failed' ? "text-red-500" : "text-cyan-500",
          borderColor: "border-cyan-200"
        };
      case 'think':
        return {
          icon: Brain,
          bgColor: status === 'running' ? "bg-indigo-500/20 animate-pulse" :
                   status === 'success' ? "bg-violet-500/20" :
                   status === 'failed' ? "bg-red-500/20" : "bg-indigo-500/20",
          iconColor: status === 'running' ? "text-indigo-500" :
                     status === 'success' ? "text-violet-500" :
                     status === 'failed' ? "text-red-500" : "text-indigo-500",
          borderColor: "border-indigo-200"
        };
      default:
        return baseStyle;
    }
  };

  const { icon: ToolIcon, bgColor, iconColor, borderColor } = getToolIconAndStyle(selectedTool.name, selectedTool.status);

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
            <div className={cn("p-2 rounded-lg", bgColor)}>
              {selectedTool.status === 'running' && <Loader2 className={cn("w-5 h-5 animate-spin", iconColor)} />}
              {selectedTool.status === 'success' && <CheckCircle className={cn("w-5 h-5", iconColor)} />}
              {selectedTool.status === 'failed' && <AlertTriangle className={cn("w-5 h-5", iconColor)} />}
              {selectedTool.status === 'pending' && <Clock className={cn("w-5 h-5", iconColor)} />}
              {selectedTool.status !== 'running' && selectedTool.status !== 'success' && selectedTool.status !== 'failed' && selectedTool.status !== 'pending' && (
                <ToolIcon className={cn("w-5 h-5", iconColor)} />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">{toolName}</h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {selectedTool.executionTime !== undefined && (
                  <span>耗时: {selectedTool.executionTime.toFixed(2)}s</span>
                )}
                {selectedTool.status === 'running' && (
                  <span className="text-blue-500">执行中...</span>
                )}
                {selectedTool.status === 'success' && (
                  <span className="text-green-500">完成</span>
                )}
                {selectedTool.status === 'failed' && (
                  <span className="text-red-500">失败</span>
                )}
              </div>
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
                <div className={cn("p-3 rounded-full mb-4", bgColor)}>
                  <Loader2 className={cn("w-8 h-8 animate-spin", iconColor)} />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">正在执行工具</h3>
                <p className="text-sm text-muted-foreground mb-4">{toolName} 正在处理中...</p>
                <div className="w-full max-w-xs bg-muted rounded-full h-2">
                  <div className="bg-current h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
              </div>
            )}

            {/* Error State */}
            {selectedTool.status === 'failed' && selectedTool.error && (
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                      工具执行失败
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-300 whitespace-pre-wrap">
                      {selectedTool.error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Result Display */}
            {hasResult && selectedTool.status !== 'running' && (
              <div className="space-y-4">
                {/* Success Header */}
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">
                    执行成功
                  </span>
                  {selectedTool.executionTime && (
                    <span className="text-xs text-green-600 dark:text-green-400 ml-auto">
                      {selectedTool.executionTime.toFixed(2)}s
                    </span>
                  )}
                </div>

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
  if (toolName === 'web_search') {
    // Debug: 如果结果不是数组，显示调试信息
    if (!Array.isArray(result)) {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Search className="w-4 h-4 text-red-500" />
            <h4 className="text-sm font-medium text-foreground">搜索结果 (调试)</h4>
          </div>
          <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium mb-2">
              ⚠️ web_search 返回了非数组结果
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-2">
              期望: 搜索结果数组，实际: {typeof result}
            </p>
            <pre className="text-xs bg-yellow-100 dark:bg-yellow-900/50 p-2 rounded border overflow-auto max-h-48">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </div>
      );
    }

    // 正常处理搜索结果数组
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <Search className="w-4 h-4 text-blue-500" />
          <h4 className="text-sm font-medium text-foreground">搜索结果</h4>
          <span className="text-xs text-muted-foreground ml-auto">{result.length} 个结果</span>
        </div>
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
      </div>
    );
  }

  // Image search results
  if (toolName === 'search_images' && Array.isArray(result)) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <Image className="w-4 h-4 text-purple-500" />
          <h4 className="text-sm font-medium text-foreground">图片搜索结果</h4>
          <span className="text-xs text-muted-foreground ml-auto">{result.length} 张图片</span>
        </div>
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
      </div>
    );
  }

  // Visit page result
  if (toolName === 'visit_page') {
    if (!result || typeof result !== 'object') {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Globe className="w-4 h-4 text-red-500" />
            <h4 className="text-sm font-medium text-foreground">网页内容 (调试)</h4>
          </div>
          <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <pre className="text-xs overflow-auto max-h-48">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <Globe className="w-4 h-4 text-cyan-500" />
          <h4 className="text-sm font-medium text-foreground">网页内容</h4>
          {result.title && <span className="text-xs text-muted-foreground ml-auto truncate max-w-[150px]">{result.title}</span>}
        </div>
        {result.title && (
          <div className="p-3 bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800 rounded-lg">
            <h5 className="font-medium text-cyan-900 dark:text-cyan-100 mb-1">{result.title}</h5>
            {result.description && <p className="text-sm text-cyan-700 dark:text-cyan-300">{result.description}</p>}
          </div>
        )}
        {result.content && (
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-sm text-foreground whitespace-pre-wrap break-words leading-relaxed">
              {result.content}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Image search results
  if (toolName === 'search_images') {
    if (!Array.isArray(result)) {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Image className="w-4 h-4 text-red-500" />
            <h4 className="text-sm font-medium text-foreground">图片搜索 (调试)</h4>
          </div>
          <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <pre className="text-xs overflow-auto max-h-48">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <Image className="w-4 h-4 text-purple-500" />
          <h4 className="text-sm font-medium text-foreground">图片搜索结果</h4>
          <span className="text-xs text-muted-foreground ml-auto">{result.length} 张图片</span>
        </div>
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
      </div>
    );
  }

  // PPT operation tools - display simple status (not raw JSON)
  if (['initialize_slide', 'insert_slides', 'update_slide'].includes(toolName)) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <Code className="w-4 h-4 text-green-500" />
          <h4 className="text-sm font-medium text-foreground">
            {toolName === 'initialize_slide' && '初始化幻灯片'}
            {toolName === 'insert_slides' && '插入幻灯片'}
            {toolName === 'update_slide' && '更新幻灯片'}
          </h4>
        </div>

        {/* Simple success message */}
        {result?.success && (
          <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  {result.message || '操作成功'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Show slide info in a clean card layout */}
        <div className="space-y-2">
          {result?.index && (
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-sm text-muted-foreground">页码</span>
              <span className="text-lg font-bold text-primary">第 {result.index} 页</span>
            </div>
          )}
          {result?.task_brief && (
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">内容描述</div>
              <p className="text-sm text-foreground line-clamp-3">{result.task_brief}</p>
            </div>
          )}
          {result?.title && (
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">演示文稿标题</div>
              <p className="text-base font-semibold text-foreground">{result.title}</p>
            </div>
          )}
          {result?.layout && (
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-sm text-muted-foreground">布局类型</span>
              <span className="text-sm font-mono text-foreground bg-background px-2 py-1 rounded">{result.layout}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // HTML tool - display the generated HTML code
  if (toolName === 'html') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <Code className="w-4 h-4 text-green-500" />
          <h4 className="text-sm font-medium text-foreground">生成HTML内容</h4>
        </div>

        {result?.html_code ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">HTML代码 (第 {result.index || 0} 页)</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigator.clipboard.writeText(result.html_code)}
                className="text-xs"
              >
                <Copy className="w-3 h-3 mr-1" />
                复制代码
              </Button>
            </div>
            <pre className="p-4 rounded-lg bg-muted text-xs text-foreground overflow-auto max-h-[600px] font-mono border border-border">
              {result.html_code}
            </pre>
          </div>
        ) : (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">⚠️ HTML 代码未生成</p>
          </div>
        )}
      </div>
    );
  }

  // Think tool
  if (toolName === 'think') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <Brain className="w-4 h-4 text-indigo-500" />
          <h4 className="text-sm font-medium text-foreground">思考过程</h4>
        </div>
        <div className="p-4 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800">
          <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
            {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
          </p>
        </div>
      </div>
    );
  }

  // Default: show JSON
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <Code className="w-4 h-4 text-gray-500" />
        <h4 className="text-sm font-medium text-foreground">原始结果</h4>
      </div>
      <pre className="p-4 rounded-lg bg-muted text-xs text-foreground overflow-auto border border-border max-h-[600px] font-mono">
        {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
}
