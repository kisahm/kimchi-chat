'use client';
import { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Key, Globe, Flame } from 'lucide-react';
import { useStore } from '@/lib/store';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SettingsModal({ open, onClose }: Props) {
  const { settings, setSettings } = useStore();
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [baseUrl, setBaseUrl] = useState(settings.baseUrl);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if (open) {
      setApiKey(settings.apiKey);
      setBaseUrl(settings.baseUrl);
    }
  }, [open, settings.apiKey, settings.baseUrl]);

  if (!open) return null;

  const isFirstRun = !settings.apiKey;

  function handleSave() {
    setSettings({ apiKey: apiKey.trim(), baseUrl: baseUrl.trim() });
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget && !isFirstRun) onClose(); }}
    >
      <div
        className="relative w-full max-w-md rounded-2xl p-6 shadow-2xl"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)' }}>
              <Flame size={16} style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                {isFirstRun ? 'Welcome to kimchi.chat' : 'Settings'}
              </h2>
              {isFirstRun && (
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Enter your API key to get started</p>
              )}
            </div>
          </div>
          {!isFirstRun && (
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-[#222]"
              style={{ color: 'var(--text-muted)' }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="space-y-4">
          {/* API Key */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              <Key size={12} />
              API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                placeholder="sk-..."
                autoFocus={isFirstRun}
                className="w-full rounded-xl px-3.5 py-2.5 pr-10 text-sm outline-none"
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  fontFamily: apiKey && !showKey ? 'monospace' : 'inherit',
                }}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors hover:opacity-80"
                style={{ color: 'var(--text-muted)' }}
              >
                {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Base URL */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              <Globe size={12} />
              API Base URL
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none font-mono"
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
            />
            <p className="mt-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
              Kimchi API or a locally running harness endpoint
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-2.5 justify-end">
          {!isFirstRun && (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm transition-all hover:bg-[#222]"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!apiKey.trim()}
            className="px-5 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-40"
            style={{ background: 'var(--accent)', color: 'white' }}
          >
            {isFirstRun ? 'Get started →' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
