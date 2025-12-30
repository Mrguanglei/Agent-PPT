import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Eye, MoreVertical } from 'lucide-react';
import type { Slide } from '@/types';

interface ThumbnailCardProps {
  slide: Slide;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const ThumbnailCard: React.FC<ThumbnailCardProps> = ({
  slide,
  onClick,
  onEdit,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <motion.div
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-gray-100 relative overflow-hidden">
        {slide.thumbnail_url ? (
          <img
            src={slide.thumbnail_url}
            alt={`Slide ${slide.index}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-200 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-primary-600 font-semibold text-lg">
                  {slide.index}
                </span>
              </div>
              <div className="text-xs text-primary-600 font-medium">
                第 {slide.index} 页
              </div>
            </div>
          </div>
        )}

        {/* Overlay with actions */}
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClick?.();
              }}
              className="p-2 bg-white bg-opacity-90 rounded-full text-gray-700 hover:bg-white transition-colors"
              title="查看幻灯片"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.();
              }}
              className="p-2 bg-white bg-opacity-90 rounded-full text-gray-700 hover:bg-white transition-colors"
              title="编辑幻灯片"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Menu button */}
        <div className="absolute top-2 right-2">
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 bg-black bg-opacity-50 hover:bg-opacity-70 rounded text-white transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Dropdown menu */}
            {showMenu && (
              <motion.div
                className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg z-10 border border-gray-200"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    onEdit?.();
                    setShowMenu(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  编辑
                </button>
                <button
                  onClick={() => {
                    onDelete?.();
                    setShowMenu(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  删除
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Card footer */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">
              第 {slide.index} 页
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {slide.html_content
                ? `${slide.html_content.length} 字符`
                : '无内容'
              }
            </p>
          </div>

          {/* Status indicator */}
          <div className={`w-2 h-2 rounded-full ${
            slide.html_content ? 'bg-green-500' : 'bg-gray-300'
          }`} />
        </div>

        {/* Assets count */}
        {slide.assets && slide.assets.length > 0 && (
          <div className="mt-2 text-xs text-gray-500">
            {slide.assets.length} 个素材
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ThumbnailCard;
