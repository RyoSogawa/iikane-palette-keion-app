import React from 'react';

import MyBestSongsList from '@/components/model/MyBestSongsList';

type Props = {
  params: {
    userId: string;
  };
};

export default async function MemberMyBestsPage({ params }: Props) {
  return <MyBestSongsList userId={params.userId} />;
}
