import React from 'react';

import { Box } from '@mantine/core';

import MyBestSongsAddModalButton from '@/features/my-best-songs/components/MyBestSongsAddModalButton';
import MyBestSongsListForEdit from '@/features/my-best-songs/components/MyBestSongsListForEdit';

type Props = {
  params: Promise<{
    userId: string;
  }>;
};

export default async function MemberMyBestsPage({ params }: Props) {
  const { userId } = await params;
  return (
    <Box>
      <MyBestSongsListForEdit userId={userId} />
      <MyBestSongsAddModalButton userId={userId} />
    </Box>
  );
}
