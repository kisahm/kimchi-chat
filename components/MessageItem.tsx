'use client';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Message } from '@/lib/types';
import { ChevronDown, ChevronRight, Flame, Copy, Check } from 'lucide-react';

interface Props {
  message: Message;
}

function parseThinking(content: string): { thinking: string | null; response: string } {
  const match = content.match(/^<think>([\s\S]*?)<\/think>([\s\S]*)$/s);
  if (match) return { thinking: match[1].trim(), response: match[2].trim() };
  if (content.startsWith('<think>') && !content.includes('</think>'))
    return { thinking: content.slice(7).trim(), response: '' };
  return { thinking: null, response: content };
}

function ThinkingBlock({ content }: { content: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-4 rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full px-4 py-2.5 text-left transition-all"
        style={{ color: 'var(--text-secondary)' }}
      >
        {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        <span className="text-xs font-medium">Reasoning</span>
        <span className="ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>
          {content.split(' ').length} words
        </span>
      </button>
      {open && (
        <div className="px-4 pb-4 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)', borderTop: '1px solid var(--border)' }}>
          <p className="pt-3 whitespace-pre-wrap font-mono">{content}</p>
        </div>
      )}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <button onClick={copy} className="p-1 rounded transition-all hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
      {copied ? <Check size={13} style={{ color: 'var(--accent)' }} /> : <Copy size={13} />}
    </button>
  );
}

const codeStyle = vscDarkPlus as Record<string, React.CSSProperties>;

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <div className="my-4 rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', background: '#0c0c0c' }}>
      <div className="flex items-center justify-between px-4 py-2.5" style={{ background: '#111', borderBottom: '1px solid var(--border)' }}>
        <span className="text-xs font-mono font-medium" style={{ color: 'var(--accent)' }}>{language}</span>
        <button onClick={copy} className="flex items-center gap-1.5 text-xs transition-all hover:opacity-80 px-2 py-1 rounded-lg" style={{ color: copied ? 'var(--accent)' : 'var(--text-muted)', background: 'var(--bg-elevated)' }}>
          {copied ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy</>}
        </button>
      </div>
      <SyntaxHighlighter
        style={codeStyle}
        language={language}
        PreTag="div"
        customStyle={{ margin: 0, background: '#0c0c0c', fontSize: '13px', padding: '16px 20px', lineHeight: '1.6' }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        code({ className, children }) {
          const match = /language-(\w+)/.exec(className || '');
          if (match) {
            return <CodeBlock language={match[1]} code={String(children).replace(/\n$/, '')} />;
          }
          return (
            <code className="px-1.5 py-0.5 rounded-md text-xs font-mono" style={{ background: 'rgba(232,68,26,0.1)', color: '#f97316', border: '1px solid rgba(232,68,26,0.15)' }}>
              {children}
            </code>
          );
        },
        p: ({ children }) => <p className="mb-3 last:mb-0 leading-7" style={{ color: 'var(--text-primary)' }}>{children}</p>,
        ul: ({ children }) => <ul className="pl-5 mb-3 space-y-1.5" style={{ listStyleType: 'disc' }}>{children}</ul>,
        ol: ({ children }) => <ol className="pl-5 mb-3 space-y-1.5" style={{ listStyleType: 'decimal' }}>{children}</ol>,
        li: ({ children }) => <li className="leading-7" style={{ color: 'var(--text-primary)' }}>{children}</li>,
        h1: ({ children }) => <h1 className="text-xl font-bold mb-3 mt-5 pb-2" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border)' }}>{children}</h1>,
        h2: ({ children }) => <h2 className="text-lg font-semibold mb-2 mt-4" style={{ color: 'var(--text-primary)' }}>{children}</h2>,
        h3: ({ children }) => <h3 className="text-base font-semibold mb-2 mt-3" style={{ color: 'var(--text-primary)' }}>{children}</h3>,
        blockquote: ({ children }) => (
          <blockquote className="pl-4 my-3" style={{ borderLeft: '2px solid var(--accent)', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            {children}
          </blockquote>
        ),
        hr: () => <hr className="my-5" style={{ borderColor: 'var(--border)', borderTopWidth: '1px' }} />,
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecorationLine: 'underline', textUnderlineOffset: '3px' }}>
            {children}
          </a>
        ),
        strong: ({ children }) => <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{children}</strong>,
        table: ({ children }) => (
          <div className="overflow-x-auto my-4 rounded-xl" style={{ border: '1px solid var(--border)' }}>
            <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>{children}</table>
          </div>
        ),
        th: ({ children }) => <th className="px-4 py-2.5 text-left text-xs font-semibold" style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>{children}</th>,
        td: ({ children }) => <td className="px-4 py-2.5" style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>{children}</td>,
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
          className="max-w-[72%] rounded-2xl rounded-br-md px-4 py-3 text-sm leading-7 whitespace-pre-wrap"
          style={{
            background: 'linear-gradient(135deg, #1e1e1e 0%, #191919 100%)',
            border: '1px solid #2a2a2a',
            color: 'var(--text-primary)',
          }}
        >
          {message.content}
        </div>
      </div>
    );
  }

  // Loading dots
  if (!message.content && message.isStreaming) {
    return (
      <div className="msg-enter flex gap-4 items-start">
        <KimchiAvatar />
        <div className="flex items-center gap-1.5 py-3">
          <span className="dot w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
          <span className="dot w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
          <span className="dot w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="msg-enter flex gap-4 items-start group">
      <KimchiAvatar />
      <div className="flex-1 min-w-0 pt-0.5">
        {thinking && <ThinkingBlock content={thinking} />}
        {response ? (
          <>
            <MarkdownContent content={response} />
            {!message.isStreaming && (
              <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <CopyButton text={response} />
              </div>
            )}
          </>
        ) : thinking && message.isStreaming ? (
          <div className="flex items-center gap-1.5 py-1">
            <span className="dot w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
            <span className="dot w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
            <span className="dot w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
          </div>
        ) : null}
        {message.isStreaming && response && (
          <span className="cursor-blink inline-block w-[2px] h-[1em] ml-0.5 translate-y-[2px] rounded-sm" style={{ background: 'var(--accent)' }} />
        )}
      </div>
    </div>
  );
}

function KimchiAvatar() {
  return (
    <div
      className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center mt-0.5"
      style={{
        background: 'linear-gradient(135deg, rgba(232,68,26,0.2) 0%, rgba(249,115,22,0.1) 100%)',
        border: '1px solid rgba(232,68,26,0.2)',
        boxShadow: '0 0 12px rgba(232,68,26,0.08)',
      }}
    >
      <Flame size={14} style={{ color: 'var(--accent)' }} />
    </div>
  );
}
