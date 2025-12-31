'use client';

import { motion } from 'framer-motion';
import { FileText, Eye, Download, Share2, Edit3, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface PPTGenerationResult {
  id: string;
  title: string;
  slideCount: number;
  status: 'generating' | 'completed' | 'failed';
  thumbnail?: string;
  downloadUrl?: string;
  previewUrl?: string;
  error?: string;
  generatedAt?: string;
}

interface PPTAssistantCardProps {
  ppt: PPTGenerationResult;
  onPreview?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  onEdit?: () => void;
}

export function PPTAssistantCard({
  ppt,
  onPreview,
  onDownload,
  onShare,
  onEdit,
}: PPTAssistantCardProps) {
  const isCompleted = ppt.status === 'completed';
  const isFailed = ppt.status === 'failed';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl my-4"
    >
      <div className={cn(
        "rounded-2xl shadow-lg overflow-hidden border-2 transition-all",
        isCompleted ? "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200" :
        isFailed ? "bg-gradient-to-br from-red-50 to-pink-50 border-red-200" :
        "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200"
      )}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-current/10 flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0",
              isCompleted ? "bg-gradient-to-br from-blue-500 to-indigo-600" :
              isFailed ? "bg-gradient-to-br from-red-500 to-pink-600" :
              "bg-gradient-to-br from-amber-500 to-orange-600"
            )}>
              {isCompleted ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : isFailed ? (
                <span className="text-lg">⚠️</span>
              ) : (
                <Loader2 className="w-6 h-6 animate-spin" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-base font-bold text-gray-900 truncate">{ppt.title}</h4>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={isCompleted ? "default" : isFailed ? "destructive" : "secondary"}>
                  {isCompleted ? "✓ 已生成" : isFailed ? "✗ 失败" : "⏳ 生成中..."}
                </Badge>
                {isCompleted && (
                  <span className="text-xs text-gray-600">
                    {ppt.slideCount} 页幻灯片
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {isCompleted ? (
            <div className="space-y-4">
              {/* Thumbnail Preview */}
              {ppt.thumbnail && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-lg overflow-hidden shadow-md border border-current/10"
                >
                  <img
                    src={ppt.thumbnail}
                    alt={ppt.title}
                    className="w-full h-auto object-cover"
                  />
                </motion.div>
              )}

              {/* Info */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white/50 rounded-lg p-3">
                  <p className="text-gray-600 text-xs mb-1">幻灯片数</p>
                  <p className="text-lg font-bold text-gray-900">{ppt.slideCount}</p>
                </div>
                <div className="bg-white/50 rounded-lg p-3">
                  <p className="text-gray-600 text-xs mb-1">生成时间</p>
                  <p className="text-lg font-bold text-gray-900">
                    {ppt.generatedAt ? new Date(ppt.generatedAt).toLocaleTimeString() : '刚刚'}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button
                  onClick={onPreview}
                  className="rounded-lg gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold"
                >
                  <Eye className="w-4 h-4" />
                  预览
                </Button>
                <Button
                  onClick={onDownload}
                  variant="outline"
                  className="rounded-lg gap-2 border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  <Download className="w-4 h-4" />
                  下载
                </Button>
              </div>

              {/* Secondary Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-current/10">
                {onShare && (
                  <Button
                    onClick={onShare}
                    variant="ghost"
                    size="sm"
                    className="rounded-lg gap-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    分享
                  </Button>
                )}
                {onEdit && (
                  <Button
                    onClick={onEdit}
                    variant="ghost"
                    size="sm"
                    className="rounded-lg gap-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    编辑
                  </Button>
                )}
              </div>
            </div>
          ) : isFailed ? (
            <div className="space-y-3">
              <p className="text-sm text-red-700">
                {ppt.error || "PPT 生成失败，请重试"}
              </p>
              <Button
                variant="outline"
                className="w-full rounded-lg border-red-200 text-red-600 hover:bg-red-50"
              >
                重新生成
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-amber-700">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>正在生成您的 PPT，请稍候...</span>
              </div>
              <div className="w-full h-2 bg-amber-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-600"
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
