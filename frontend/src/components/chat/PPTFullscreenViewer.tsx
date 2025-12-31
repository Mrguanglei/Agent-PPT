'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Download, Share2, Fullscreen, Minimize2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { PPTSlideRenderer, type SlideContent } from './PPTSlideRenderer';
import { cn } from '@/lib/utils';

interface PPTFullscreenViewerProps {
  slides: SlideContent[];
  title?: string;
  isOpen: boolean;
  onClose: () => void;
  onDownload?: () => void;
  onShare?: () => void;
}

export function PPTFullscreenViewer({
  slides,
  title = 'PPT 演示',
  isOpen,
  onClose,
  onDownload,
  onShare,
}: PPTFullscreenViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [showControls, setShowControls] = useState(true);

  const handlePrevious = useCallback(() => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : slides.length - 1));
  }, [slides.length]);

  const handleNext = useCallback(() => {
    setCurrentSlide((prev) => (prev < slides.length - 1 ? prev + 1 : 0));
  }, [slides.length]);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev < slides.length - 1 ? prev + 1 : 0));
    }, 5000); // 5 seconds per slide

    return () => clearInterval(timer);
  }, [isPlaying, slides.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') onClose();
      if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handlePrevious, handleNext, onClose, isPlaying]);

  if (!isOpen || slides.length === 0) return null;

  const slide = slides[currentSlide];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black flex flex-col"
        onMouseMove={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
          <div className="w-full h-full max-w-6xl aspect-video">
            <PPTSlideRenderer
              slide={slide}
              slideNumber={currentSlide + 1}
              totalSlides={slides.length}
              isActive={true}
            />
          </div>
        </div>

        {/* Top Control Bar */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-0 left-0 right-0 px-8 py-4 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between"
            >
              <div className="text-white">
                <h2 className="text-lg font-bold">{title}</h2>
                <p className="text-xs text-gray-300 mt-1">
                  第 {currentSlide + 1} / {slides.length} 页
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 rounded-full"
                onClick={onClose}
              >
                <X className="w-5 h-5" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Control Bar */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-0 left-0 right-0 px-8 py-6 bg-gradient-to-t from-black/80 to-transparent"
            >
              {/* Progress Bar */}
              <div className="w-full h-1 bg-white/20 rounded-full mb-6 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                  animate={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20 rounded-full"
                    onClick={handlePrevious}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20 rounded-full"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20 rounded-full"
                    onClick={handleNext}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                  <div className="w-px h-6 bg-white/20 mx-2" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20 rounded-full"
                    onClick={() => setCurrentSlide(0)}
                  >
                    <RotateCcw className="w-5 h-5" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  {onShare && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20 rounded-full"
                      onClick={onShare}
                    >
                      <Share2 className="w-5 h-5" />
                    </Button>
                  )}
                  {onDownload && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20 rounded-full"
                      onClick={onDownload}
                    >
                      <Download className="w-5 h-5" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20 rounded-full"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                  >
                    {isFullscreen ? (
                      <Minimize2 className="w-5 h-5" />
                    ) : (
                      <Fullscreen className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Keyboard Hints */}
              <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-400">
                <span>← → 导航</span>
                <span>空格 播放/暂停</span>
                <span>ESC 退出</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Slide Thumbnails - Side Panel */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="absolute left-0 top-0 bottom-0 w-24 bg-black/60 backdrop-blur-sm p-2 overflow-y-auto"
            >
              <div className="space-y-2">
                {slides.map((_, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={cn(
                      "w-full aspect-video rounded-lg overflow-hidden border-2 transition-all",
                      currentSlide === index
                        ? "border-blue-500 shadow-lg shadow-blue-500/50"
                        : "border-white/20 hover:border-white/40"
                    )}
                  >
                    <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-white/60">{index + 1}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
