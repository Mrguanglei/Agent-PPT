import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Edit, Download, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';

interface Slide {
  id: string;
  index: number;
  html_content: string;
  thumbnail_url?: string;
}

interface SlidePreviewGridProps {
  slides: Slide[];
}

export const SlidePreviewGrid: React.FC<SlidePreviewGridProps> = ({ slides }) => {
  const [selectedSlide, setSelectedSlide] = useState<Slide | null>(null);

  if (slides.length === 0) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
      >
        {/* 标题 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              生成的幻灯片 ({slides.length} 张)
            </h3>
            <p className="text-sm text-gray-500">
              点击预览查看完整内容
            </p>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4" />
            导出PPT
          </button>
        </div>

        {/* 幻灯片网格 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {slides.map((slide, index) => (
            <SlideCard
              key={slide.id}
              slide={slide}
              index={index}
              onPreview={() => setSelectedSlide(slide)}
            />
          ))}
        </div>
      </motion.div>

      {/* 幻灯片预览模态框 */}
      <SlidePreviewModal
        slide={selectedSlide}
        onClose={() => setSelectedSlide(null)}
        totalSlides={slides.length}
      />
    </>
  );
};

interface SlideCardProps {
  slide: Slide;
  index: number;
  onPreview: () => void;
}

const SlideCard: React.FC<SlideCardProps> = ({ slide, index, onPreview }) => {
  return (
    <motion.div
      className="group relative bg-gray-50 rounded-lg overflow-hidden border border-gray-200 hover:border-blue-400 transition-all cursor-pointer"
      whileHover={{ scale: 1.02 }}
      onClick={onPreview}
    >
      {/* 幻灯片缩略图 */}
      <div className="aspect-[16/9] bg-white flex items-center justify-center p-4">
        {slide.thumbnail_url ? (
          <img
            src={slide.thumbnail_url}
            alt={`幻灯片 ${index + 1}`}
            className="w-full h-full object-cover rounded"
          />
        ) : (
          <div className="text-center text-gray-400">
            <div className="text-2xl font-bold mb-2">{index + 1}</div>
            <div className="text-xs">幻灯片预览</div>
          </div>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPreview();
          }}
          className="p-2 bg-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Eye className="w-4 h-4 text-gray-700" />
        </button>

        <button
          onClick={(e) => e.stopPropagation()}
          className="p-2 bg-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Edit className="w-4 h-4 text-gray-700" />
        </button>
      </div>

      {/* 页码 */}
      <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
        {index + 1}
      </div>
    </motion.div>
  );
};

interface SlidePreviewModalProps {
  slide: Slide | null;
  onClose: () => void;
  totalSlides: number;
}

const SlidePreviewModal: React.FC<SlidePreviewModalProps> = ({ slide, onClose, totalSlides }) => {
  if (!slide) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          {/* 模态框头部 */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold text-gray-900">
                幻灯片 {slide.index + 1}
              </h3>
              <span className="text-sm text-gray-500">
                共 {totalSlides} 张
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <ChevronRight className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Maximize2 className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>

          {/* 幻灯片内容 */}
          <div className="p-6 overflow-y-auto max-h-[70vh]">
            <div
              className="bg-white border border-gray-200 rounded-lg overflow-hidden"
              style={{ aspectRatio: '16/9' }}
            >
              <div
                className="w-full h-full"
                dangerouslySetInnerHTML={{ __html: slide.html_content }}
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
