'use client';
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import ChatWindow from '@/components/ChatWindow';
import SettingsModal from '@/components/SettingsModal';
import { useStore } from '@/lib/store';

export default function Home() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { settings } = useStore();

  // Auto-open settings if no API key configured
  const shouldShowSettings = settingsOpen || !settings.apiKey;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar onOpenSettings={() => setSettingsOpen(true)} />
      <main className="flex-1 overflow-hidden">
        <ChatWindow />
      </main>
      <SettingsModal
        open={shouldShowSettings}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}
