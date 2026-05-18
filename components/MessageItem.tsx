'use client';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Message } from '@/lib/types';
import { ChevronDown, ChevronRight, Flame } from 'lucide-react';

interface Props {
  message: Message;
}

function parseThinking(content: string): { thinking: string | null; response: string } {
  const match = content.match(/^<think>([\s\S]*?)<\/think>([\s\S]*)$/);
  if (match) {
    return { thinking: match[1].trim(), response: match[2].trim() };
  }
  // Still streaming thinking block
  if (content.startsWith('<think>') && !content.includes('</think>')) {
    return { thinking: content.slice(7).trim(), response: '' };
  }
  return { thinking: null, response: content };
}

function ThinkingBlock({ content }: { content: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-4 rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full px-3 py-2 text-left transition-colors hover:bg-[#222]"
      >
        {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
          Reasoning
        </span>
      </button>
      {open && (
        <div className="px-4 pb-3 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)', borderTop: '1px solid var(--border)' }}>
          <p className="pt-3 whitespace-pre-wrap">{content}</p>
        </div>
      )}
    </div>
  );
}

const codeStyle = vscDarkPlus as Record<string, React.CSSProperties>;

function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        code({ className, children }) {
          const match = /language-(\w+)/.exec(className || '');
          if (match) {
            return (
              <div className="my-3 rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between px-4 py-2" style={{ background: '#161616', borderBottom: '1px solid var(--border)' }}>
                  <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{match[1]}</span>
                </div>
                <SyntaxHighlighter
                  style={codeStyle}
                  language={match[1]}
                  PreTag="div"
                  customStyle={{ margin: 0, background: '#0f0f0f', fontSize: '13px', padding: '16px' }}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            );
          }
          return (
            <code className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ background: 'rgba(255,255,255,0.08)', color: '#e8b89a' }}>
              {children}
            </code>
          );
        },
        p: ({ children }) => <p className="mb-3 last:mb-0 leading-7">{children}</p>,
        ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>,
        li: ({ children }) => <li className="leading-6">{children}</li>,
        h1: ({ children }) => <h1 className="text-xl font-bold mb-3 mt-4">{children}</h1>,
        h2: ({ children }) => <h2 className="text-lg font-semibold mb-2 mt-4">{children}</h2>,
        h3: ({ children }) => <h3 className="text-base font-semibold mb-2 mt-3">{children}</h3>,
        blockquote: ({ children }) => (
          <blockquote className="pl-4 my-3 italic" style={{ borderLeft: '2px solid var(--accent)', color: 'var(--text-secondary)' }}>
            {children}
          </blockquote>
        ),
        hr: () => <hr className="my-4" style={{ borderColor: 'var(--border)' }} />,
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
            {children}
          </a>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto my-3">
            <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>{children}</table>
          </div>
        ),
        th: ({ children }) => <th className="px-3 py-2 text-left text-xs font-semibold" style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>{children}</th>,
        td: ({ children }) => <td className="px-3 py-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>{children}</td>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export default function MessageItem({ message }: Props) {
  const isUser = message.role === 'user';
  const { thinking, response } = parseThinking(message.content);

  if (isUser) {
    return (
      <div className="msg-enter flex justify-end">
        <div
          className="max-w-[75%] rounded-2xl rounded-br-sm px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
        >
          {message.content}
        </div>
      </div>
    );
  }

  // Still loading — no content yet
  if (!message.content && message.isStreaming) {
    return (
      <div className="msg-enter flex gap-3">
        <div className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5" style={{ background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)' }}>
          <Flame size={13} style={{ color: 'var(--accent)' }} />
        </div>
        <div className="flex items-center gap-1.5 py-2">
          <span className="thinking-dot w-1.5 h-1.5 rounded-full" style={{ background: 'var(--text-muted)' }} />
          <span className="thinking-dot w-1.5 h-1.5 rounded-full" style={{ background: 'var(--text-muted)' }} />
          <span className="thinking-dot w-1.5 h-1.5 rounded-full" style={{ background: 'var(--text-muted)' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="msg-enter flex gap-3">
      <div className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5" style={{ background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)' }}>
        <Flame size={13} style={{ color: 'var(--accent)' }} />
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        {thinking && <ThinkingBlock content={thinking} />}
        {response ? (
          <MarkdownContent content={response} />
        ) : thinking && message.isStreaming ? (
          <div className="flex items-center gap-1.5 py-1">
            <span className="thinking-dot w-1.5 h-1.5 rounded-full" style={{ background: 'var(--text-muted)' }} />
            <span className="thinking-dot w-1.5 h-1.5 rounded-full" style={{ background: 'var(--text-muted)' }} />
            <span className="thinking-dot w-1.5 h-1.5 rounded-full" style={{ background: 'var(--text-muted)' }} />
          </div>
        ) : null}
        {message.isStreaming && response && (
          <span className="inline-block w-0.5 h-4 ml-0.5 translate-y-0.5 animate-pulse rounded-sm" style={{ background: 'var(--accent)' }} />
        )}
      </div>
    </div>
  );
}
