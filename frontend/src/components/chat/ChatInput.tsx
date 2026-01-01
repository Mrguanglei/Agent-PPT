'use client';

import React from 'react';
import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Send, Paperclip, StopCircle, Mic, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (content: string) => void;
  onStop?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput = React.memo(function ChatInput({ onSend, onStop, disabled, placeholder = '输入您的问题或指令...' }: ChatInputProps) {
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
    // 检查是否正在使用中文输入法（IME）
    if (e.nativeEvent.isComposing) return;

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-4 pb-4">
      <div
        className={cn(
          'relative flex flex-col p-2 rounded-[24px]',
          'bg-card border border-border shadow-lg',
          'focus-within:border-primary/30 focus-within:ring-4 focus-within:ring-primary/5',
          'transition-all duration-300 ease-out'
        )}
      >
        {/* 输入区域 */}
        <div className="flex items-end gap-2 px-2">
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
              'text-[15px] text-foreground placeholder:text-muted-foreground/60',
              'focus:outline-none',
              'min-h-[44px] max-h-[200px] py-3 px-2',
              'scrollbar-none'
            )}
          />
        </div>

        {/* 工具栏区域 */}
        <div className="flex items-center justify-between mt-1 px-1">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/5"
              disabled={disabled}
            >
              <Paperclip className="h-4.5 w-4.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/5"
              disabled={disabled}
            >
              <ImageIcon className="h-4.5 w-4.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/5"
              disabled={disabled}
            >
              <Mic className="h-4.5 w-4.5" />
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-muted-foreground/60 font-medium hidden sm:inline-block">
              {value.length} / 2000
            </span>
            <motion.div whileTap={{ scale: 0.92 }}>
              {disabled ? (
                <Button
                  size="icon"
                  onClick={onStop}
                  className="h-9 w-9 rounded-full bg-destructive hover:bg-destructive/90 shadow-md"
                >
                  <StopCircle className="h-4.5 w-4.5" />
                </Button>
              ) : (
                <Button
                  size="icon"
                  onClick={handleSubmit}
                  disabled={!value.trim()}
                  className={cn(
                    'h-9 w-9 rounded-full shadow-md transition-all duration-300',
                    value.trim() 
                      ? 'bg-primary text-primary-foreground scale-100' 
                      : 'bg-muted text-muted-foreground scale-95 opacity-50'
                  )}
                >
                  <Send className="h-4.5 w-4.5" />
                </Button>
              )}
            </motion.div>
          </div>
        </div>
      </div>
      
      <p className="text-center mt-3 text-[11px] text-muted-foreground/50 font-medium">
        PPT Agent 可能会产生错误，请核查重要信息。
      </p>
    </div>
  );
});
