'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Download, Fullscreen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Slide } from '@/types/slide';

interface SlideCarouselProps {
  slides: Slide[];
  onSlideChange?: (index: number) => void;
}

export function SlideCarousel({ slides, onSlideChange }: SlideCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const currentSlide = slides[currentIndex];

  const goToPrev = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : slides.length - 1;
    setCurrentIndex(newIndex);
    onSlideChange?.(newIndex);
  };

  const goToNext = () => {
    const newIndex = currentIndex < slides.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(newIndex);
    onSlideChange?.(newIndex);
  };

  const handleExport = (format: 'html' | 'pdf') => {
    if (!currentSlide) return;

    if (format === 'html') {
      // Export as HTML
      const blob = new Blob([currentSlide.html_content], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `slide-${currentIndex + 1}.html`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  if (!currentSlide) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No slides available
      </div>
    );
  }

  return (
    <div className={cn(
      "flex flex-col h-full bg-background",
      isFullscreen && "fixed inset-0 z-50 bg-black"
    )}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            Slide {currentIndex + 1} / {slides.length}
          </span>
          <span className="text-sm text-muted-foreground">
            {currentSlide.title || 'Untitled'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleExport('html')}
            title="Export as HTML"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title="Toggle fullscreen"
          >
            <Fullscreen className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Slide Content */}
      <ScrollArea className="flex-1">
        <div className="flex items-center justify-center p-8">
          <div
            className="relative bg-white shadow-lg"
            style={{
              width: '1280px',
              height: '720px',
              transform: isFullscreen ? 'scale(1)' : 'scale(0.8)',
              transformOrigin: 'center center',
            }}
          >
            {/* Render HTML content */}
            <div
              dangerouslySetInnerHTML={{ __html: currentSlide.html_content }}
              className="w-full h-full"
            />
          </div>
        </div>
      </ScrollArea>

      {/* Navigation */}
      <div className="flex items-center justify-between p-4 border-t border-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPrev}
          disabled={slides.length <= 1}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <div className="flex gap-1">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentIndex(idx);
                onSlideChange?.(idx);
              }}
              className={cn(
                'w-2 h-2 rounded-full transition-colors',
                idx === currentIndex
                  ? 'bg-primary'
                  : 'bg-muted-foreground hover:bg-foreground'
              )}
            />
          ))}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={goToNext}
          disabled={slides.length <= 1}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Close fullscreen button */}
      {isFullscreen && (
        <button
          onClick={() => setIsFullscreen(false)}
          className="fixed top-4 right-4 z-50 p-2 bg-background rounded-full border border-border shadow-lg"
        >
          ✕
        </button>
      )}
    </div>
  );
}
