import React from 'react';

import { Container } from '@mantine/core';
import { notFound } from 'next/navigation';

import { getServerAuthSession } from '@/server/auth';

import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '管理画面',
  robots: { index: false, follow: false },
};

/**
 * 管理画面の入り口。管理者以外には存在を知らせないよう、未ログインも含めて 404 にする。
 * API は adminProcedure が別に守っているので、ここは画面を出さないためのもの。
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerAuthSession();
  if (!session?.user.isAdmin) {
    notFound();
  }

  return <Container py={16}>{children}</Container>;
}
