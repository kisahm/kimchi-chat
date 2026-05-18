'use client';
import { useRef, useEffect, useState } from 'react';
import { Send, Square, Paperclip } from 'lucide-react';

interface Props {
  onSend: (content: string) => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled?: boolean;
}

export default function MessageInput({ onSend, onStop, isStreaming, disabled }: Props) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 144) + 'px';
  }, [value]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleSend() {
    const trimmed = value.trim();
    if (!trimmed || isStreaming || disabled) return;
    onSend(trimmed);
    setValue('');
  }

  return (
    <div
      className="relative flex items-end gap-2 rounded-xl p-2"
      style={{
        background: 'var(--bg-input)',
        border: '1px solid var(--border)',
      }}
    >
      <button
        className="flex-shrink-0 p-2 rounded-lg transition-colors"
        style={{ color: 'var(--text-muted)' }}
        title="Attach file (coming soon)"
        disabled
      >
        <Paperclip size={18} />
      </button>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Message Kimchi... (Shift+Enter for new line)"
        disabled={disabled}
        rows={1}
        className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted"
        style={{
          color: 'var(--text-primary)',
          maxHeight: '144px',
          lineHeight: '1.5',
        }}
      />

      <button
        onClick={isStreaming ? onStop : handleSend}
        disabled={!isStreaming && (!value.trim() || disabled)}
        className="flex-shrink-0 p-2 rounded-lg transition-colors disabled:opacity-40"
        style={{
          background: isStreaming ? 'var(--bg-hover)' : 'var(--accent)',
          color: 'white',
        }}
      >
        {isStreaming ? <Square size={18} /> : <Send size={18} />}
      </button>
    </div>
  );
}
