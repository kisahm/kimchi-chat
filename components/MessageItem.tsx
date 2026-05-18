'use client';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Message } from '@/lib/types';
import { Bot, User } from 'lucide-react';

interface Props {
  message: Message;
}

export default function MessageItem({ message }: Props) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
        style={{
          background: isUser ? 'var(--accent)' : 'var(--bg-card)',
          border: isUser ? 'none' : '1px solid var(--border)',
        }}
      >
        {isUser ? (
          <User size={16} color="white" />
        ) : (
          <Bot size={16} style={{ color: 'var(--accent)' }} />
        )}
      </div>

      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser ? 'rounded-tr-sm' : 'rounded-tl-sm'
        }`}
        style={{
          background: isUser ? 'var(--accent)' : 'var(--bg-card)',
          color: isUser ? 'white' : 'var(--text-primary)',
          border: isUser ? 'none' : '1px solid var(--border)',
        }}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <ReactMarkdown
            components={{
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                const isBlock = match != null;
                return isBlock ? (
                  <SyntaxHighlighter
                    style={vscDarkPlus as Record<string, React.CSSProperties>}
                    language={match[1]}
                    PreTag="div"
                    className="rounded-lg my-2 text-xs"
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code
                    className="px-1 py-0.5 rounded text-xs"
                    style={{ background: 'rgba(255,255,255,0.1)' }}
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
              li: ({ children }) => <li className="mb-0.5">{children}</li>,
              h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
              h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
              h3: ({ children }) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-2 pl-3 my-2 italic" style={{ borderColor: 'var(--accent)', color: 'var(--text-secondary)' }}>
                  {children}
                </blockquote>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
        {message.isStreaming && (
          <span
            className="inline-block w-2 h-4 ml-1 animate-pulse rounded-sm"
            style={{ background: 'var(--accent)' }}
          />
        )}
      </div>
    </div>
  );
}
