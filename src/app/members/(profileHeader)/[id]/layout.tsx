import React from 'react';

import { Container } from '@mantine/core';

import UserProfile from '@/components/model/UserProfile';
import UserProfileTab from '@/components/model/UserProfileTab';
import { getServerAuthSession } from '@/server/auth';
import { api } from '@/trpc/server';

type Props = {
  params: {
    id: string;
  };
  children: React.ReactNode;
};

export default async function MemberSingleLayout({ params, children }: Props) {
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
    <Container py={32}>
      <UserProfile user={user} isCurrentUser={session?.user.id === user.id} />
      <UserProfileTab userId={params.id} />
      {children}
    </Container>
  );
}
