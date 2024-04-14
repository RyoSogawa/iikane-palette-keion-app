import React from 'react';

import { Box } from '@mantine/core';

import MyBestSongsAddModalButton from '@/features/my-best-songs/components/MyBestSongsAddModalButton';
import MyBestSongsList from '@/features/my-best-songs/components/MyBestSongsList';

type Props = {
  params: {
    userId: string;
  };
};

export default async function MemberMyBestsPage({ params }: Props) {
  return (
    <Box>
      <MyBestSongsAddModalButton userId={params.userId} />
      <MyBestSongsList userId={params.userId} editable />
    </Box>
  );
}
