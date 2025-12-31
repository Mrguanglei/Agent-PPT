'use client';

import { motion } from 'framer-motion';
import { Sparkles, Image, FileText, Presentation } from 'lucide-react';
import { ChatInput } from './ChatInput';

const SUGGESTIONS = [
  {
    icon: Presentation,
    title: 'Product Launch PPT',
    prompt: 'Help me create a product launch presentation with product features, market analysis, and pricing strategy',
  },
  {
    icon: FileText,
    title: 'Annual Summary',
    prompt: 'Create a 2024 annual work summary PPT with key achievements, project highlights, and next year plans',
  },
  {
    icon: Image,
    title: 'AI Technology Intro',
    prompt: 'Make a presentation about the history of AI development with images and timeline',
  },
];

export function WelcomeScreen({ onSend }: { onSend: (content: string) => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary mb-4">
          <Sparkles className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">PPT Agent</h1>
        <p className="text-muted-foreground max-w-md">
          Tell me what kind of PPT you want, and I'll automatically search for materials, find images,
          and design the layout
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 w-full max-w-3xl"
      >
        {SUGGESTIONS.map((item, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSend(item.prompt)}
            className="p-4 rounded-xl text-left bg-card border border-border hover:border-primary/50 transition-colors duration-200"
          >
            <item.icon className="w-5 h-5 text-primary mb-2" />
            <h3 className="font-medium text-foreground mb-1">{item.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{item.prompt}</p>
          </motion.button>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-2xl"
      >
        <ChatInput onSend={onSend} placeholder="Describe the PPT you want..." />
      </motion.div>
    </div>
  );
}
