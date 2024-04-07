import React from 'react';

import { Box, Text } from '@mantine/core';

import { api } from '@/trpc/server';

type Props = {
  params: {
    userId: string;
  };
};

export default async function MemberMyBestsPage({ params }: Props) {
  const [user] = await Promise.all([
    api.user.findById.query({
      id: params.userId,
    }),
  ]);

  if (!user) {
    throw new Error('メンバーが見つかりませんでした');
  }

  return (
    <Box mx={{ base: 0, sm: 32 }}>
      <Text>Coming soon...</Text>
    </Box>
  );
}
