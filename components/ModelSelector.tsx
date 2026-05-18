'use client';
import { useEffect, useState } from 'react';
import { ChevronDown, Zap } from 'lucide-react';
import { useStore } from '@/lib/store';
import { fetchModels } from '@/lib/kimchi-client';
import { KimchiModel } from '@/lib/types';

export default function ModelSelector() {
  const { settings, setSettings } = useStore();
  const [models, setModels] = useState<KimchiModel[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!settings.apiKey) return;
    fetchModels(settings.apiKey, settings.baseUrl).then(setModels);
  }, [settings.apiKey, settings.baseUrl]);

  const options = [
    { id: 'auto', label: 'Auto', sublabel: 'Kimchi selects best model' },
    ...models.map((m) => ({ id: m.id, label: m.id, sublabel: '' })),
  ];

  const current = options.find((o) => o.id === settings.selectedModel) ?? options[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all hover:bg-[#222]"
        style={{
          background: 'var(--bg-elevated)',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border)',
        }}
      >
        <Zap size={12} style={{ color: 'var(--accent)' }} />
        <span className="max-w-[140px] truncate">{current?.label}</span>
        <ChevronDown size={12} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-full mt-2 z-20 rounded-2xl py-1.5 shadow-2xl min-w-[220px] max-h-72 overflow-auto"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
          >
            <p className="px-4 pt-1 pb-2 text-[11px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Model
            </p>
            {options.map((o) => {
              const active = o.id === settings.selectedModel;
              return (
                <button
                  key={o.id}
                  onClick={() => { setSettings({ selectedModel: o.id }); setOpen(false); }}
                  className="flex flex-col w-full text-left px-4 py-2 transition-colors hover:bg-[#222]"
                >
                  <span className="text-sm" style={{ color: active ? 'var(--accent)' : 'var(--text-primary)' }}>
                    {o.label}
                    {active && <span className="ml-2 text-xs">✓</span>}
                  </span>
                  {o.sublabel && (
                    <span className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{o.sublabel}</span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
