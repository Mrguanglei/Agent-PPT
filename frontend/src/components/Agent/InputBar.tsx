import React, { useState, useRef, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader } from 'lucide-react';

interface InputBarProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const InputBar: React.FC<InputBarProps> = ({
  onSend,
  disabled = false,
  placeholder = '输入消息...'
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  return (
    <motion.div
      className="flex items-end gap-3 p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Input Area */}
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
          style={{
            minHeight: '44px',
            maxHeight: '120px',
          }}
          rows={1}
        />

        {/* Character count */}
        {message.length > 0 && (
          <div className="absolute bottom-2 right-3 text-xs text-gray-400">
            {message.length}
          </div>
        )}
      </div>

      {/* Send Button */}
      <motion.button
        onClick={handleSend}
        disabled={!message.trim() || disabled}
        className={`p-3 rounded-lg transition-all duration-200 ${
          message.trim() && !disabled
            ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-md'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
        whileHover={message.trim() && !disabled ? { scale: 1.05 } : {}}
        whileTap={message.trim() && !disabled ? { scale: 0.95 } : {}}
      >
        {disabled ? (
          <Loader className="w-5 h-5 animate-spin" />
        ) : (
          <Send className="w-5 h-5" />
        )}
      </motion.button>
    </motion.div>
  );
};

export default InputBar;
