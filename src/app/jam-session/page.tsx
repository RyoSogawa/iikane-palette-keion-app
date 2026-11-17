import React from 'react';

import { redirect } from 'next/navigation';

import SessionList from '@/features/jam-session/components/SessionList';
import { getServerAuthSession } from '@/server/auth';
import { api } from '@/trpc/server';
import { todayInJst } from '@/utils/held-on';

import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'セッション',
  robots: { index: false, follow: false },
};

/** セッションの一覧。ログイン済みのメンバーだけが見られ、誰でもセッションを作れる */
export default async function JamSessionListPage() {
  const session = await getServerAuthSession();
  if (!session) {
    redirect('/');
  }

  const caller = await api();
  const sessions = await caller.jamSession.list();

  return <SessionList initialData={sessions} today={todayInJst(new Date())} />;
}
