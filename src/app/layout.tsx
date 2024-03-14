import '@mantine/core/styles.css';
import '@mantine/tiptap/styles.css';
import '@mantine/notifications/styles.css';
import '../styles/global.css';

import React from 'react';

import { ColorSchemeScript } from '@mantine/core';

import AppShell from '@/components/application/AppShell';
import Providers from '@/components/functional/Providers';

export const metadata = {
  title: 'いいかねパレット軽音部',
  description: 'いいかねパレット軽音部のポータルサイトです。',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
