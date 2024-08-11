import '@mantine/core/styles.css';
import '@mantine/tiptap/styles.css';
import '@mantine/notifications/styles.css';
import '../styles/global.css';

import React from 'react';

import { ColorSchemeScript } from '@mantine/core';
import { type Metadata, type Viewport } from 'next';

import { SITE_NAME } from '@/constants/site-info';
import Providers from '@/ui/components/functional/Providers';
import AppShell from 'src/features/application/components/AppShell';

export const viewport: Viewport = {
  themeColor: '#242424',
};

export const metadata: Metadata = {
  title: {
    template: `%s | ${SITE_NAME}`,
    default: SITE_NAME,
  },
  description: 'いいかねパレット軽音部のポータルサイトです。',
  metadataBase: new URL(process.env.NEXTAUTH_URL!), // HACK: env.NEXTAUTH_URLだと正常に取得できないのでprocessから指定
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <ColorSchemeScript defaultColorScheme="dark" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicons/favicon-16x16.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="msapplication-config" content="/favicon/browserconfig.xml" />
      </head>
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
