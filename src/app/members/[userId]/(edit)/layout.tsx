import React from 'react';

import { Button, Container, Space } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';

import UserProfileTab from '@/components/model/UserProfileTab';
import { getServerAuthSession } from '@/server/auth';
import { api } from '@/trpc/server';

type Props = {
  params: {
    userId: string;
  };
  children: React.ReactNode;
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

  return (
    <Container py={32}>
      <Button
        component={Link}
        href={`/members/${params.userId}/profile`}
        variant="subtle"
        color="gray"
      >
        <IconArrowLeft size={16} />
        <Space w={4} />
        戻る
      </Button>
      <UserProfileTab userId={params.userId} isEdit />
      {children}
    </Container>
  );
}
