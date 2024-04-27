import React from 'react';

import { Button, Container, Space, Title } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';

import { SITE_NAME } from '@/constants/site-info';
import UserProfileTab from '@/features/user/components/UserProfileTab';
import { getServerAuthSession } from '@/server/auth';
import { api } from '@/trpc/server';

import type { Metadata } from 'next';

type Props = {
  params: {
    userId: string;
  };
  children: React.ReactNode;
};

export const metadata: Metadata = {
  title: `プロフィール編集 | ${SITE_NAME}`,
};

export default async function MemberSingleLayout({ params, children }: Props) {
  const [user, session] = await Promise.all([
    api.user.findById.query({
      id: params.userId,
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
    <Container pt={16} pb={32}>
      <Button
        component={Link}
        href={`/members/${params.userId}/profile`}
        variant="default"
        color="gray"
        size="xs"
      >
        <IconArrowLeft size={14} />
        <Space w={4} />
        戻る
      </Button>
      <Title size="h2" mt={24}>
        プロフィール編集
      </Title>
      <UserProfileTab userId={params.userId} isEdit />
      {children}
    </Container>
  );
}
