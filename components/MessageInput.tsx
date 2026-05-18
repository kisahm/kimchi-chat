'use client';
import { useRef, useEffect, useState } from 'react';
import { ArrowUp, Square } from 'lucide-react';

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
    ta.style.height = Math.min(ta.scrollHeight, 200) + 'px';
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
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }

  const canSend = value.trim().length > 0 && !isStreaming && !disabled;

  return (
    <div
      className="input-wrap relative rounded-2xl transition-all"
      style={{
        background: 'var(--bg-input)',
        border: '1px solid var(--border)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      }}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={disabled ? 'Enter API key in Settings to start chatting…' : 'Message Kimchi…'}
        disabled={disabled}
        rows={1}
        className="w-full resize-none bg-transparent text-sm outline-none px-4 pt-3.5 pb-3 pr-14"
        style={{
          color: 'var(--text-primary)',
          maxHeight: '200px',
          lineHeight: '1.6',
          caretColor: 'var(--accent)',
        }}
      />

      <div className="absolute right-2.5 bottom-2.5">
        {isStreaming ? (
          <button
            onClick={onStop}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
            style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)' }}
            title="Stop generating"
          >
            <Square size={14} style={{ color: 'var(--text-secondary)' }} />
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!canSend}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
            style={{
              background: canSend ? 'var(--accent)' : 'var(--bg-hover)',
              border: canSend ? 'none' : '1px solid var(--border)',
            }}
          >
            <ArrowUp size={16} color={canSend ? 'white' : 'var(--text-muted)'} strokeWidth={2.5} />
          </button>
        )}
      </div>
    </div>
  );
}
