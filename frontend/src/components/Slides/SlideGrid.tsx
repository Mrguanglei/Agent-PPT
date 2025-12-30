import React from 'react';
import { motion } from 'framer-motion';
import type { Slide } from '@/types';
import ThumbnailCard from './ThumbnailCard';

interface SlideGridProps {
  slides: Slide[];
  onSlideClick?: (slide: Slide) => void;
  onSlideEdit?: (slide: Slide) => void;
  onSlideDelete?: (slide: Slide) => void;
}

const SlideGrid: React.FC<SlideGridProps> = ({
  slides,
  onSlideClick,
  onSlideEdit,
  onSlideDelete,
}) => {
  if (slides.length === 0) {
    return (
      <motion.div
        className="text-center py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="text-gray-400">
          <svg
            className="w-16 h-16 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-lg font-medium">暂无幻灯片</p>
          <p className="text-sm">开始与AI对话创建你的第一张幻灯片</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1 }}
    >
      {slides.map((slide, index) => (
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <ThumbnailCard
            slide={slide}
            onClick={() => onSlideClick?.(slide)}
            onEdit={() => onSlideEdit?.(slide)}
            onDelete={() => onSlideDelete?.(slide)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default SlideGrid;
