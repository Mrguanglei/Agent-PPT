'use client';

import { useState } from 'react';
import { SlideCarousel } from './SlideCarousel';
import type { Slide } from '@/types/slide';

interface SlidePreviewProps {
  slides: Slide[];
  isOpen: boolean;
  onClose: () => void;
}

export function SlidePreview({ slides, isOpen, onClose }: SlidePreviewProps) {
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full h-full bg-background">
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-background border border-border rounded-md hover:bg-muted"
          >
            Close Preview
          </button>
        </div>

        <SlideCarousel
          slides={slides}
          onSlideChange={setSelectedSlideIndex}
        />
      </div>
    </div>
  );
}
