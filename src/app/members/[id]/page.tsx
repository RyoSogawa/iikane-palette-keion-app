import React from 'react';

import { Avatar, Button, Container, Flex, Space, Title, Text } from '@mantine/core';
import Link from 'next/link';

import { getServerAuthSession } from '@/server/auth';
import { api } from '@/trpc/server';

type Props = {
  params: {
    id: string;
  };
};

export default async function MemberSinglePage({ params }: Props) {
  const [user, session] = await Promise.all([
    api.user.findById.query({
      id: params.id,
    }),
    getServerAuthSession(),
  ]);

  if (!user) {
    throw new Error('メンバーが見つかりませんでした');
  }

  return (
    <Container component="main" py={16}>
      <Flex align="center">
        <Button component={Link} href="/" variant="outline">
          ← 部員一覧へ
        </Button>
        <Space flex={1} />
        {session?.user.id === user.id && (
          <Button component={Link} href={`/members/${user.id}/edit`} variant="outline">
            編集
          </Button>
        )}
      </Flex>
      <Avatar src={user.image} alt={user.name ?? 'アバター'} size={120} mt={32} mx="auto" />
      <Title order={1} ta="center" mt={16}>
        {user.name}
      </Title>
      {user.nickname && (
        <Text ta="center" c="dimmed" fz="sm" mt={8}>
          {user.nickname}
        </Text>
      )}
    </Container>
  );
}
