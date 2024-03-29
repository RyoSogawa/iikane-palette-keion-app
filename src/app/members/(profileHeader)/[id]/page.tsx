import React from 'react';

import { Container } from '@mantine/core';

import EditorViewer from '@/components/ui/EditorViewer';
import { api } from '@/trpc/server';

type Props = {
  params: {
    id: string;
  };
};

export default async function MemberProfilePage({ params }: Props) {
  const [user] = await Promise.all([
    api.user.findById.query({
      id: params.id,
    }),
  ]);

  if (!user) {
    throw new Error('メンバーが見つかりませんでした');
  }

  if (!user.introduction) {
    return null;
  }

  return (
    <Container>
      <EditorViewer value={user.introduction} mx={{ base: 0, sm: 32 }} />
    </Container>
  );
}
