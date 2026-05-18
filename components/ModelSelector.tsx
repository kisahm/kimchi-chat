'use client';
import { useEffect, useState } from 'react';
import { ChevronDown, Cpu } from 'lucide-react';
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
    { id: 'auto', label: '✦ Auto — Kimchi wählt' },
    ...models.map((m) => ({ id: m.id, label: m.id })),
  ];

  const current = options.find((o) => o.id === settings.selectedModel) ?? options[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors"
        style={{
          background: 'var(--bg-hover)',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border)',
        }}
      >
        <Cpu size={14} style={{ color: 'var(--accent)' }} />
        <span className="max-w-[160px] truncate">{current?.label}</span>
        <ChevronDown size={14} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute left-0 top-full mt-1 z-20 rounded-lg border py-1 shadow-lg min-w-[200px] max-h-64 overflow-auto"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
          >
            {options.map((o) => (
              <button
                key={o.id}
                onClick={() => {
                  setSettings({ selectedModel: o.id });
                  setOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm transition-colors"
                style={{
                  color: o.id === settings.selectedModel ? 'var(--accent)' : 'var(--text-primary)',
                  background: o.id === settings.selectedModel ? 'rgba(232,68,26,0.1)' : 'transparent',
                }}
              >
                {o.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
