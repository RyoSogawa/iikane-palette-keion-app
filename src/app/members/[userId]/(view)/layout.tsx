import React from 'react';

import { Container } from '@mantine/core';

import { SITE_NAME } from '@/constants/site-info';
import UserProfile from '@/features/user/components/UserProfile';
import UserProfileTab from '@/features/user/components/UserProfileTab';
import { getServerAuthSession } from '@/server/auth';
import { api } from '@/trpc/server';

import type { Metadata } from 'next';

export const revalidate = 3600;

type Props = {
  params: {
    userId: string;
  };
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const user = await api.user.findById.query({
    id: params.userId,
  });

  return {
    title: `${user?.name} | ${SITE_NAME}`,
  };
}

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
