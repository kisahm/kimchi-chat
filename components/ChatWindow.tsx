'use client';
import { useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import MessageItem from './MessageItem';
import MessageInput from './MessageInput';
import ModelSelector from './ModelSelector';
import { useChat } from '@/hooks/useChat';
import { Flame, Sparkles, Code2, FileText } from 'lucide-react';

const SUGGESTIONS = [
  { icon: Sparkles, label: 'Explain a concept', prompt: 'Explain how large language models work in simple terms.' },
  { icon: Code2, label: 'Write code', prompt: 'Write a TypeScript function that debounces any async function.' },
  { icon: FileText, label: 'Summarize text', prompt: 'What are the best practices for writing clean, maintainable code?' },
];

export default function ChatWindow() {
  const { getActiveConversation, settings } = useStore();
  const { sendMessage, stopGeneration, isStreaming } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const conv = getActiveConversation();
  const streaming = isStreaming();
  const noApiKey = !settings.apiKey;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (isNearBottom || streaming) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conv?.messages.at(-1)?.content, streaming]);

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-base)' }}>
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-5 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <span className="text-sm font-medium truncate max-w-sm" style={{ color: 'var(--text-secondary)' }}>
          {conv?.title && conv.title !== 'New Chat' ? conv.title : ''}
        </span>
        <ModelSelector />
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {!conv || conv.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-8 px-4">
            {/* Logo */}
            <div className="flex flex-col items-center gap-3">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)' }}
              >
                <Flame size={28} style={{ color: 'var(--accent)' }} />
              </div>
              <div className="text-center">
                <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  kimchi<span style={{ color: 'var(--accent)' }}>.</span>chat
                </h1>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                  {noApiKey ? 'Enter your API key in Settings to begin' : 'How can I help you today?'}
                </p>
              </div>
            </div>

            {/* Suggestions */}
            {!noApiKey && (
              <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                {SUGGESTIONS.map(({ icon: Icon, label, prompt }) => (
                  <button
                    key={label}
                    onClick={() => sendMessage(prompt)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all hover:border-[var(--accent)]"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                  >
                    <Icon size={14} style={{ color: 'var(--accent)' }} />
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
            {conv.messages.map((msg) => (
              <MessageItem key={msg.id} message={msg} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 px-4 pb-5 pt-3">
        <div className="max-w-3xl mx-auto">
          <MessageInput
            onSend={(content) => sendMessage(content, conv?.id)}
            onStop={stopGeneration}
            isStreaming={streaming}
            disabled={noApiKey}
          />
          <p className="mt-2.5 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
            Powered by{' '}
            <span style={{ color: 'var(--accent)', fontWeight: 500 }}>kimchi.dev</span>
            {' '}· AI can make mistakes
          </p>
        </div>
      </div>
    </div>
  );
}
