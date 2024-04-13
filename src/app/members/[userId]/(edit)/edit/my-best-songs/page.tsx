import React from 'react';

import { Box } from '@mantine/core';

import MyBestSongsList from '@/components/model/MyBestSongsList';
import MyBestSongsAddModalButton from 'src/components/model/MyBestSongsAddModalButton';

type Props = {
  params: {
    userId: string;
  };
};

export default async function MemberMyBestsPage({ params }: Props) {
  return (
    <Box>
      <MyBestSongsAddModalButton />
      <MyBestSongsList userId={params.userId} />
    </Box>
  );
}
