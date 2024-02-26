import React from 'react';

import { Button, Container, Flex, Space } from '@mantine/core';
import Link from 'next/link';

import { getServerAuthSession } from '@/server/auth';
import { api } from '@/trpc/server';

type Props = {
  params: {
    id: string;
  };
};

export default async function MemberSinglePage({ params }: Props) {
  const user = await api.user.findById.query({
    id: params.id,
  });

  if (!user) {
    throw new Error('User not found');
  }

  const session = await getServerAuthSession();

  return (
    <Container component="main" py={16}>
      <Flex align="center">
        <Button component={Link} href="/" variant="outline">
          ← 部員一覧へ
        </Button>
        <Space flex={1} />
        {session?.user.id === user.id && (
          <Button component={Link} href={`/member/${user.id}/edit`} variant="outline">
            編集
          </Button>
        )}
      </Flex>
    </Container>
  );
}
