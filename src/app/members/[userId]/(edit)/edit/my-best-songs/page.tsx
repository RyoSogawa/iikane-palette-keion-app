import React from 'react';

import { Box, Text, Title } from '@mantine/core';

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
    <Box>
      <Title order={1} mt={40} mb={32}>
        My Best Songs
      </Title>
      <Text>Coming soon...</Text>
    </Box>
  );
}
