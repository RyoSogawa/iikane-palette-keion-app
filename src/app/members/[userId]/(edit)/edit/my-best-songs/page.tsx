import React from 'react';

import { Box } from '@mantine/core';

import MyBestSongsAddModalButton from '@/features/my-best-songs/components/MyBestSongsAddModalButton';
import MyBestSongsGridForEdit from '@/features/my-best-songs/components/MyBestSongsGridForEdit';

type Props = {
  params: {
    userId: string;
  };
};

export default async function MemberMyBestsPage({ params }: Props) {
  return (
    <Box>
      <MyBestSongsGridForEdit userId={params.userId} />
      <MyBestSongsAddModalButton userId={params.userId} />
    </Box>
  );
}
