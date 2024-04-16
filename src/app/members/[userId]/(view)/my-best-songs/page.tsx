import React from 'react';

import MyBestSongsList from '@/features/my-best-songs/components/MyBestSongsList';
import { api } from '@/trpc/server';

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

  return <MyBestSongsList data={myBestSongs} />;
}
