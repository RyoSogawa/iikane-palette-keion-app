import '@mantine/core/styles.css';
import '@mantine/tiptap/styles.css';
import '@mantine/notifications/styles.css';
import '../styles/global.css';

import React from 'react';

import { ColorSchemeScript } from '@mantine/core';
import { type Metadata } from 'next';

import AppShell from '@/components/application/AppShell';
import Providers from '@/components/functional/Providers';
import { SITE_NAME } from '@/constants/site-info';

export const metadata: Metadata = {
  title: SITE_NAME,
  description: 'いいかねパレット軽音部のポータルサイトです。',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <ColorSchemeScript defaultColorScheme="dark" />
      </head>
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
