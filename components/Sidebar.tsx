'use client';
import { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X, Settings, PanelLeftClose, PanelLeftOpen, Flame, MessageSquare } from 'lucide-react';
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
        className="flex flex-col items-center py-3 gap-2 flex-shrink-0"
        style={{ width: '52px', background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border-subtle)' }}
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-1" style={{ background: 'var(--accent-subtle)' }}>
          <Flame size={15} style={{ color: 'var(--accent)' }} />
        </div>
        <button
          onClick={() => setCollapsed(false)}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[#222]"
          style={{ color: 'var(--text-muted)' }}
          title="Expand sidebar"
        >
          <PanelLeftOpen size={16} />
        </button>
        <button
          onClick={handleNew}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[#222]"
          style={{ color: 'var(--text-muted)' }}
          title="New chat"
        >
          <Plus size={16} />
        </button>
        <div className="flex-1" />
        <button
          onClick={onOpenSettings}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[#222]"
          style={{ color: 'var(--text-muted)' }}
          title="Settings"
        >
          <Settings size={16} />
        </button>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col flex-shrink-0"
      style={{ width: '260px', background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border-subtle)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)' }}>
            <Flame size={14} style={{ color: 'var(--accent)' }} />
          </div>
          <span className="font-semibold text-sm tracking-tight" style={{ color: 'var(--text-primary)' }}>
            kimchi<span style={{ color: 'var(--accent)' }}>.</span>chat
          </span>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-[#222]"
          style={{ color: 'var(--text-muted)' }}
          title="Collapse sidebar"
        >
          <PanelLeftClose size={15} />
        </button>
      </div>

      {/* New Chat button */}
      <div className="px-3 pb-3">
        <button
          onClick={handleNew}
          className="flex items-center gap-2.5 w-full rounded-xl px-3 py-2.5 text-sm font-medium transition-all hover:bg-[#1e1e1e]"
          style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
        >
          <Plus size={15} style={{ color: 'var(--accent)' }} />
          New Chat
        </button>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8">
            <MessageSquare size={20} style={{ color: 'var(--text-muted)' }} />
            <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>No conversations yet</p>
          </div>
        ) : (
          Object.entries(grouped).map(([group, convs]) => (
            <div key={group} className="mb-4">
              <p className="px-2 pb-1 text-[11px] font-medium uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                {group}
              </p>
              {convs.map((conv) => (
                <div
                  key={conv.id}
                  className={`sidebar-item group relative flex items-center rounded-xl px-2.5 py-2 cursor-pointer transition-all mb-0.5 ${conv.id === activeConversationId ? 'sidebar-item-active' : ''}`}
                  style={{
                    border: '1px solid transparent',
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
                        className="flex-1 text-xs bg-transparent outline-none"
                        style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--accent)' }}
                      />
                      <button onClick={() => confirmEdit(conv.id)} style={{ color: 'var(--accent)' }}><Check size={12} /></button>
                      <button onClick={() => setEditingId(null)} style={{ color: 'var(--text-muted)' }}><X size={12} /></button>
                    </div>
                  ) : (
                    <>
                      <span
                        className="flex-1 text-xs truncate leading-5"
                        style={{ color: conv.id === activeConversationId ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                      >
                        {conv.title}
                      </span>
                      <div className="hidden group-hover:flex items-center gap-0.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => startEdit(conv.id, conv.title)}
                          className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors hover:bg-[#2a2a2a]"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          <Edit2 size={11} />
                        </button>
                        <button
                          onClick={() => deleteConversation(conv.id)}
                          className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors hover:bg-[#2a2a2a]"
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
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2.5 w-full rounded-xl px-3 py-2 text-sm transition-all hover:bg-[#1a1a1a]"
          style={{ color: 'var(--text-secondary)' }}
        >
          <Settings size={15} />
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
