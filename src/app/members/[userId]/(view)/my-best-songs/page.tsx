import React from 'react';

import MyBestSongs from '@/features/my-best-songs/components/MyBestSongs';
import { api } from '@/trpc/server';

export const revalidate = 3600;

type Props = {
  params: Promise<{
    userId: string;
  }>;
};

export default async function MemberMyBestsPage({ params }: Props) {
  const { userId } = await params;
  const trpc = await api();
  const [myBestSongs] = await Promise.all([trpc.myBestSongs.findByUserId({ userId })]);

  if (!myBestSongs?.length) return null;

  return <MyBestSongs data={myBestSongs} />;
}
