import React from 'react';

import { redirect } from 'next/navigation';

import JamSessionBoard from '@/features/jam-session/components/JamSessionBoard';
import { getServerAuthSession } from '@/server/auth';
import { api } from '@/trpc/server';

import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'セッション',
  robots: { index: false, follow: false },
};

/** 当日のセッションで、いる人とやりたい曲を持ち寄るページ。ログイン済みのメンバーだけが見られる */
export default async function JamSessionPage() {
  const session = await getServerAuthSession();
  if (!session) {
    redirect('/');
  }

  const caller = await api();
  const initialData = await caller.jamSession.board();

  return <JamSessionBoard initialData={initialData} />;
}
