import React from 'react';

import { Container } from '@mantine/core';

import { api } from '@/trpc/server';

type Props = {
  params: {
    id: string;
  };
};

export default async function MemberMyBestsPage({ params }: Props) {
  const [user] = await Promise.all([
    api.user.findById.query({
      id: params.id,
    }),
  ]);

  if (!user) {
    throw new Error('メンバーが見つかりませんでした');
  }

  return <Container>my best songs...</Container>;
}
