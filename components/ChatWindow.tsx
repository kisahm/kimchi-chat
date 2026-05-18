'use client';
import { useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import MessageItem from './MessageItem';
import MessageInput from './MessageInput';
import ModelSelector from './ModelSelector';
import { useChat } from '@/hooks/useChat';
import { Flame } from 'lucide-react';

export default function ChatWindow() {
  const { getActiveConversation, settings } = useStore();
  const { sendMessage, stopGeneration, isStreaming } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);
  const conv = getActiveConversation();
  const streaming = isStreaming();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conv?.messages.length, conv?.messages.at(-1)?.content]);

  const noApiKey = !settings.apiKey;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            {conv?.title ?? 'New Chat'}
          </span>
        </div>
        <ModelSelector />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {!conv || conv.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(232,68,26,0.15)', border: '1px solid rgba(232,68,26,0.3)' }}
            >
              <Flame size={32} style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                Kimchi Chat
              </h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {noApiKey
                  ? 'Set your API key in Settings to get started'
                  : 'Start a conversation with AI'}
              </p>
            </div>
            {noApiKey && (
              <p className="text-xs px-4 py-2 rounded-lg" style={{ background: 'rgba(232,68,26,0.1)', color: 'var(--accent)', border: '1px solid rgba(232,68,26,0.2)' }}>
                ⚙ Open Settings (gear icon) to enter your API key
              </p>
            )}
          </div>
        ) : (
          <>
            {conv.messages.map((msg) => (
              <MessageItem key={msg.id} message={msg} />
            ))}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-4 pb-4">
        <MessageInput
          onSend={(content) => sendMessage(content, conv?.id)}
          onStop={stopGeneration}
          isStreaming={streaming}
          disabled={noApiKey}
        />
        <p className="mt-2 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
          Powered by <span style={{ color: 'var(--accent)' }}>kimchi.dev</span> · OpenAI-compatible API
        </p>
      </div>
    </div>
  );
}
