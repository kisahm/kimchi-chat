'use client';
import { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X, Settings, ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import { useStore } from '@/lib/store';

interface Props {
  onOpenSettings: () => void;
}

export default function Sidebar({ onOpenSettings }: Props) {
  const {
    conversations,
    activeConversationId,
    createConversation,
    setActiveConversation,
    deleteConversation,
    renameConversation,
  } = useStore();

  const [collapsed, setCollapsed] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  function startEdit(id: string, title: string) {
    setEditingId(id);
    setEditTitle(title);
  }

  function confirmEdit(id: string) {
    if (editTitle.trim()) renameConversation(id, editTitle.trim());
    setEditingId(null);
  }

  function handleNew() {
    createConversation();
  }

  const grouped = groupByDate(conversations);

  if (collapsed) {
    return (
      <div
        className="flex flex-col items-center py-4 gap-3 w-12 flex-shrink-0 border-r"
        style={{ background: 'var(--bg-sidebar)', borderColor: 'var(--border)' }}
      >
        <button onClick={() => setCollapsed(false)} style={{ color: 'var(--text-muted)' }}>
          <ChevronRight size={18} />
        </button>
        <button onClick={handleNew} style={{ color: 'var(--accent)' }}>
          <Plus size={18} />
        </button>
        <div className="flex-1" />
        <button onClick={onOpenSettings} style={{ color: 'var(--text-muted)' }}>
          <Settings size={18} />
        </button>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col w-64 flex-shrink-0 border-r"
      style={{ background: 'var(--bg-sidebar)', borderColor: 'var(--border)' }}
    >
      {/* Logo + Collapse */}
      <div className="flex items-center justify-between px-4 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <Flame size={20} style={{ color: 'var(--accent)' }} />
          <span className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>kimchi</span>
          <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(232,68,26,0.2)', color: 'var(--accent)' }}>chat</span>
        </div>
        <button onClick={() => setCollapsed(true)} style={{ color: 'var(--text-muted)' }}>
          <ChevronLeft size={18} />
        </button>
      </div>

      {/* New Chat */}
      <div className="px-3 py-3">
        <button
          onClick={handleNew}
          className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm transition-colors"
          style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
        >
          <Plus size={16} style={{ color: 'var(--accent)' }} />
          New Chat
        </button>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-2">
        {Object.entries(grouped).map(([group, convs]) => (
          <div key={group} className="mb-3">
            <p className="px-2 py-1 text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              {group}
            </p>
            {convs.map((conv) => (
              <div
                key={conv.id}
                className="group relative flex items-center rounded-lg px-2 py-1.5 cursor-pointer transition-colors mb-0.5"
                style={{
                  background: conv.id === activeConversationId ? 'rgba(232,68,26,0.12)' : 'transparent',
                  border: conv.id === activeConversationId ? '1px solid rgba(232,68,26,0.25)' : '1px solid transparent',
                }}
                onClick={() => setActiveConversation(conv.id)}
              >
                {editingId === conv.id ? (
                  <div className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
                    <input
                      autoFocus
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') confirmEdit(conv.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      className="flex-1 text-xs bg-transparent outline-none border-b"
                      style={{ color: 'var(--text-primary)', borderColor: 'var(--accent)' }}
                    />
                    <button onClick={() => confirmEdit(conv.id)} style={{ color: 'var(--accent)' }}><Check size={12} /></button>
                    <button onClick={() => setEditingId(null)} style={{ color: 'var(--text-muted)' }}><X size={12} /></button>
                  </div>
                ) : (
                  <>
                    <span className="flex-1 text-xs truncate" style={{ color: conv.id === activeConversationId ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                      {conv.title}
                    </span>
                    <div className="hidden group-hover:flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => startEdit(conv.id, conv.title)}
                        className="p-1 rounded transition-colors hover:text-primary"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <Edit2 size={11} />
                      </button>
                      <button
                        onClick={() => deleteConversation(conv.id)}
                        className="p-1 rounded transition-colors"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Settings */}
      <div className="px-3 py-3 border-t" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          <Settings size={16} />
          Settings
        </button>
      </div>
    </div>
  );
}

function groupByDate(convs: Array<{ id: string; title: string; updatedAt: number }>) {
  const now = Date.now();
  const day = 86400000;
  const groups: Record<string, typeof convs> = {};

  for (const c of convs) {
    const diff = now - c.updatedAt;
    const label =
      diff < day ? 'Today' :
      diff < 2 * day ? 'Yesterday' :
      diff < 7 * day ? 'Last 7 days' :
      diff < 30 * day ? 'Last 30 days' : 'Older';
    (groups[label] ??= []).push(c);
  }
  return groups;
}
