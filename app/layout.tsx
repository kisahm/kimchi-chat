import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kimchi Chat',
  description: 'AI Chat powered by kimchi.dev',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
