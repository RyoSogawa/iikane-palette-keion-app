import React from 'react';

import { Container } from '@mantine/core';

import UserProfile from '@/features/user/components/UserProfile';
import UserProfileTab from '@/features/user/components/UserProfileTab';
import { getServerAuthSession } from '@/server/auth';
import { api } from '@/trpc/server';

export const revalidate = 3600;

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
      <UserProfile user={user} isCurrentUser={session?.user.id === user.id} />
      <UserProfileTab userId={params.userId} />
      {children}
    </Container>
  );
}
