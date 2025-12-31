'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Maximize2, Minimize2, Download } from 'lucide-react';
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface PPTSlide {
  id: string;
  title: string;
  content: string;
  thumbnail?: string;
  layout?: 'title' | 'content' | 'two-column' | 'image';
}

interface PPTPreviewModalProps {
  slides: PPTSlide[];
  title?: string;
  isOpen: boolean;
  onClose: () => void;
  onDownload?: () => void;
}

export function PPTPreviewModal({
  slides,
  title = 'PPT 预览',
  isOpen,
  onClose,
  onDownload,
}: PPTPreviewModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handlePrevious = useCallback(() => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : slides.length - 1));
  }, [slides.length]);

  const handleNext = useCallback(() => {
    setCurrentSlide((prev) => (prev < slides.length - 1 ? prev + 1 : 0));
  }, [slides.length]);

  if (!isOpen || slides.length === 0) return null;

  const slide = slides[currentSlide];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center",
          isFullscreen ? "bg-black" : "bg-black/50 backdrop-blur-sm"
        )}
        onClick={isFullscreen ? undefined : onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "bg-card rounded-2xl shadow-2xl overflow-hidden flex flex-col",
            isFullscreen ? "w-screen h-screen rounded-none" : "w-[90vw] h-[90vh] max-w-5xl"
          )}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/20">
            <div>
              <h3 className="text-lg font-bold text-foreground">{title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                第 {currentSlide + 1} / {slides.length} 页
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-lg"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </Button>
              {onDownload && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-lg"
                  onClick={onDownload}
                >
                  <Download className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-lg"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Main Slide */}
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-muted/50 to-muted/20 p-8 relative overflow-hidden">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full flex flex-col items-center justify-center bg-white rounded-xl shadow-lg p-12 text-center"
              >
                <h2 className="text-3xl font-bold text-foreground mb-6">{slide.title}</h2>
                <div className="text-muted-foreground text-base leading-relaxed max-w-2xl whitespace-pre-wrap">
                  {slide.content}
                </div>
              </motion.div>

              {/* Navigation Arrows */}
              <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Thumbnail Strip */}
            {!isFullscreen && (
              <div className="w-32 border-l border-border bg-muted/10 overflow-y-auto">
                <div className="p-2 space-y-2">
                  {slides.map((s, index) => (
                    <motion.button
                      key={s.id}
                      onClick={() => setCurrentSlide(index)}
                      className={cn(
                        "w-full aspect-video rounded-lg overflow-hidden border-2 transition-all",
                        currentSlide === index
                          ? "border-primary shadow-lg"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-foreground/60">{index + 1}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-border bg-muted/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg"
                onClick={handlePrevious}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> 上一页
              </Button>
              <div className="h-6 w-px bg-border" />
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg"
                onClick={handleNext}
              >
                下一页 <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, slides.length) }).map((_, i) => (
                <motion.div
                  key={i}
                  className={cn(
                    "h-1 rounded-full transition-all",
                    i === currentSlide % 5 ? "w-6 bg-primary" : "w-1 bg-muted-foreground"
                  )}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
