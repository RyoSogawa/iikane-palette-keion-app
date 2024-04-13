import React from 'react';

import MyBestSongsList from '@/features/my-best-songs/components/MyBestSongsList';

type Props = {
  params: {
    userId: string;
  };
};

export default async function MemberMyBestsPage({ params }: Props) {
  return <MyBestSongsList userId={params.userId} />;
}
