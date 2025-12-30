import React, { useState, useRef } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface InputBarProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const InputBar: React.FC<InputBarProps> = ({
  onSend,
  disabled = false,
  placeholder = '告诉我PPT的主题或内容'
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // 自动调整高度
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  return (
    <div className="flex items-end gap-3">
      {/* 输入框 */}
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 placeholder:text-gray-400"
          style={{
            minHeight: '48px',
            maxHeight: '120px',
          }}
          rows={1}
        />

        {/* 字数统计 */}
        {message.length > 0 && (
          <div className="absolute bottom-2 right-3 text-xs text-gray-400">
            {message.length}
          </div>
        )}
      </div>

      {/* 发送按钮 */}
      <button
        onClick={handleSend}
        disabled={!message.trim() || disabled}
        className={`p-3 rounded-xl transition-all duration-200 ${
          message.trim() && !disabled
            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        {disabled ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Send className="w-5 h-5" />
        )}
      </button>
    </div>
  );
};

export default InputBar;
