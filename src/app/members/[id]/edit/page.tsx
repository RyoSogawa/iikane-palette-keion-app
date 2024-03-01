import React from 'react';

import { Button, Container, Flex, Title } from '@mantine/core';
import Link from 'next/link';

import UserForm from '@/components/model/UserForm';
import { getServerAuthSession } from '@/server/auth';
import { api } from '@/trpc/server';

type Props = {
  params: {
    id: string;
  };
};

export default async function MemberEditPage({ params }: Props) {
  const [user, session] = await Promise.all([
    api.user.findById.query({
      id: params.id,
    }),
    getServerAuthSession(),
  ]);

  if (!user) {
    throw new Error('メンバーが見つかりませんでした');
  }

  if (session?.user.id !== user.id) {
    throw new Error('アクセス権がありません');
  }

  return (
    <Container component="main" py={16}>
      <Flex align="center">
        <Button component={Link} href={`/members/${params.id}`} variant="subtle" color="gray">
          ← 戻る
        </Button>
      </Flex>
      <Title order={1} mt={32} mb={16}>
        プロフィール編集
      </Title>
      <UserForm user={user} />
    </Container>
  );
}
