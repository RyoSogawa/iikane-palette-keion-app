import React from 'react';

import MyBestSongs from '@/features/my-best-songs/components/MyBestSongs';
import { api } from '@/trpc/server';

export const revalidate = 3600;

type Props = {
  params: {
    userId: string;
  };
};

export default async function MemberMyBestsPage({ params }: Props) {
  const [myBestSongs] = await Promise.all([
    api.myBestSongs.findByUserId.query({ userId: params.userId }),
  ]);

  if (!myBestSongs?.length) return null;

  return <MyBestSongs data={myBestSongs} />;
}
