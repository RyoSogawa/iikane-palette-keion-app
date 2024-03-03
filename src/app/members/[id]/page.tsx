import React from 'react';

import { Avatar, Button, Container, Flex, Space, Title, Text, Box } from '@mantine/core';
import { IconArrowLeft, IconEdit } from '@tabler/icons-react';
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
        <Button component={Link} href="/" variant="subtle" color="gray">
          <IconArrowLeft size={16} />
          <Space w={4} />
          部員一覧へ
        </Button>
        <Space flex={1} />
        {session?.user.id === user.id && (
          <Button component={Link} href={`/members/${user.id}/edit`} variant="outline" color="gray">
            <IconEdit size={16} />
            <Space w={4} />
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
      {user.residence && <Text mt={8}>{user.residence}</Text>}
      {user.introduction && (
        <Box
          mt={8}
          dangerouslySetInnerHTML={{
            __html: user.introduction,
          }}
        />
      )}
    </Container>
  );
}
