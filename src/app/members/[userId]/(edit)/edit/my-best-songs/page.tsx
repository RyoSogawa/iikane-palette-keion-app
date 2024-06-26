import React from 'react';

import { Box } from '@mantine/core';

import MyBestSongsAddModalButton from '@/features/my-best-songs/components/MyBestSongsAddModalButton';
import MyBestSongsListForEdit from '@/features/my-best-songs/components/MyBestSongsListForEdit';

type Props = {
  params: {
    userId: string;
  };
};

export default async function MemberMyBestsPage({ params }: Props) {
  return (
    <Box>
      <MyBestSongsListForEdit userId={params.userId} />
      <MyBestSongsAddModalButton userId={params.userId} />
    </Box>
  );
}
