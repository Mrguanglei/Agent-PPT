'use client';

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Send, Paperclip, StopCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled, placeholder = 'Type a message...' }: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto adjust height
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  }, []);

  const handleSubmit = () => {
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className={cn(
        'relative flex items-end gap-2 p-3 rounded-2xl',
        'bg-card border border-border',
        'focus-within:border-primary/50',
        'transition-colors duration-200'
      )}
    >
      <Button variant="ghost" size="icon" className="h-9 w-9 flex-shrink-0">
        <Paperclip className="h-4 w-4 text-muted-foreground" />
      </Button>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          adjustHeight();
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className={cn(
          'flex-1 resize-none bg-transparent',
          'text-foreground placeholder:text-muted-foreground',
          'focus:outline-none',
          'max-h-[200px] py-2'
        )}
      />

      <motion.div whileTap={{ scale: 0.95 }}>
        {disabled ? (
          <Button size="icon" className="h-9 w-9 rounded-xl bg-destructive hover:bg-destructive/90">
            <StopCircle className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            size="icon"
            onClick={handleSubmit}
            disabled={!value.trim()}
            className={cn(
              'h-9 w-9 rounded-xl',
              'bg-primary hover:bg-primary/90',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <Send className="h-4 w-4" />
          </Button>
        )}
      </motion.div>
    </div>
  );
}
