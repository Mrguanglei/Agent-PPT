'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type SlideLayout = 'title' | 'content' | 'two-column' | 'image' | 'bullet-list' | 'quote';

export interface SlideContent {
  title?: string;
  subtitle?: string;
  content?: string;
  items?: string[];
  image?: string;
  layout: SlideLayout;
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
}

interface PPTSlideRendererProps {
  slide: SlideContent;
  slideNumber: number;
  totalSlides: number;
  isActive?: boolean;
}

export function PPTSlideRenderer({
  slide,
  slideNumber,
  totalSlides,
  isActive = true,
}: PPTSlideRendererProps) {
  const bgColor = slide.backgroundColor || 'bg-white';
  const textColor = slide.textColor || 'text-gray-900';
  const accentColor = slide.accentColor || 'from-blue-500 to-blue-600';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isActive ? 1 : 0.5 }}
      className={cn(
        "w-full h-full rounded-2xl shadow-2xl overflow-hidden flex flex-col",
        bgColor
      )}
    >
      {/* Render based on layout */}
      {slide.layout === 'title' && (
        <TitleLayout slide={slide} textColor={textColor} accentColor={accentColor} />
      )}
      {slide.layout === 'content' && (
        <ContentLayout slide={slide} textColor={textColor} accentColor={accentColor} />
      )}
      {slide.layout === 'two-column' && (
        <TwoColumnLayout slide={slide} textColor={textColor} accentColor={accentColor} />
      )}
      {slide.layout === 'bullet-list' && (
        <BulletListLayout slide={slide} textColor={textColor} accentColor={accentColor} />
      )}
      {slide.layout === 'quote' && (
        <QuoteLayout slide={slide} textColor={textColor} accentColor={accentColor} />
      )}
      {slide.layout === 'image' && (
        <ImageLayout slide={slide} textColor={textColor} accentColor={accentColor} />
      )}

      {/* Footer */}
      <div className={cn("mt-auto px-8 py-6 flex items-center justify-between border-t border-gray-200", textColor)}>
        <div className="text-sm font-medium opacity-60">
          {slide.title}
        </div>
        <div className="text-sm font-bold opacity-80">
          {slideNumber} / {totalSlides}
        </div>
      </div>
    </motion.div>
  );
}

function TitleLayout({
  slide,
  textColor,
  accentColor,
}: {
  slide: SlideContent;
  textColor: string;
  accentColor: string;
}) {
  return (
    <div className={cn("flex-1 flex flex-col items-center justify-center px-12 text-center", textColor)}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={cn("text-6xl font-black mb-6 bg-gradient-to-r", accentColor, "bg-clip-text text-transparent")}
      >
        {slide.title}
      </motion.div>
      {slide.subtitle && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-light opacity-70"
        >
          {slide.subtitle}
        </motion.div>
      )}
    </div>
  );
}

function ContentLayout({
  slide,
  textColor,
  accentColor,
}: {
  slide: SlideContent;
  textColor: string;
  accentColor: string;
}) {
  return (
    <div className={cn("flex-1 flex flex-col px-12 py-8", textColor)}>
      <motion.h2
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={cn("text-4xl font-bold mb-8 pb-4 border-b-4", accentColor.replace('from-', 'border-'))}
      >
        {slide.title}
      </motion.h2>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex-1 text-lg leading-relaxed whitespace-pre-wrap"
      >
        {slide.content}
      </motion.div>
    </div>
  );
}

function TwoColumnLayout({
  slide,
  textColor,
  accentColor,
}: {
  slide: SlideContent;
  textColor: string;
  accentColor: string;
}) {
  const [left, right] = (slide.content || '').split('|');

  return (
    <div className={cn("flex-1 flex flex-col px-12 py-8", textColor)}>
      <motion.h2
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={cn("text-3xl font-bold mb-6 pb-3 border-b-4", accentColor.replace('from-', 'border-'))}
      >
        {slide.title}
      </motion.h2>
      <div className="flex-1 grid grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col"
        >
          {left && <p className="text-base leading-relaxed whitespace-pre-wrap">{left}</p>}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col"
        >
          {right && <p className="text-base leading-relaxed whitespace-pre-wrap">{right}</p>}
        </motion.div>
      </div>
    </div>
  );
}

function BulletListLayout({
  slide,
  textColor,
  accentColor,
}: {
  slide: SlideContent;
  textColor: string;
  accentColor: string;
}) {
  return (
    <div className={cn("flex-1 flex flex-col px-12 py-8", textColor)}>
      <motion.h2
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={cn("text-3xl font-bold mb-8 pb-3 border-b-4", accentColor.replace('from-', 'border-'))}
      >
        {slide.title}
      </motion.h2>
      <ul className="flex-1 space-y-4">
        {slide.items?.map((item, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            className="flex items-start gap-4 text-lg"
          >
            <div className={cn("w-3 h-3 rounded-full mt-2 flex-shrink-0", accentColor.replace('from-', 'bg-'))} />
            <span>{item}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

function QuoteLayout({
  slide,
  textColor,
  accentColor,
}: {
  slide: SlideContent;
  textColor: string;
  accentColor: string;
}) {
  return (
    <div className={cn("flex-1 flex flex-col items-center justify-center px-12", textColor)}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className={cn("text-5xl font-light mb-6 italic", accentColor.replace('from-', 'text-'))}>
          "{slide.content}"
        </div>
        {slide.title && (
          <div className="text-xl font-bold opacity-70">— {slide.title}</div>
        )}
      </motion.div>
    </div>
  );
}

function ImageLayout({
  slide,
  textColor,
  accentColor,
}: {
  slide: SlideContent;
  textColor: string;
  accentColor: string;
}) {
  return (
    <div className={cn("flex-1 flex flex-col items-center justify-center px-12 py-8", textColor)}>
      {slide.title && (
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn("text-3xl font-bold mb-6 pb-3 border-b-4", accentColor.replace('from-', 'border-'))}
        >
          {slide.title}
        </motion.h2>
      )}
      {slide.image && (
        <motion.img
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          src={slide.image}
          alt={slide.title}
          className="max-w-full max-h-96 rounded-xl shadow-lg"
        />
      )}
      {slide.content && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center text-lg mt-6 opacity-70"
        >
          {slide.content}
        </motion.p>
      )}
    </div>
  );
}
