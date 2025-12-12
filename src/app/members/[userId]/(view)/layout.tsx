import React from 'react';

import { Container } from '@mantine/core';

import UserProfile from '@/features/user/components/UserProfile';
import UserProfileTab from '@/features/user/components/UserProfileTab';
import { getServerAuthSession } from '@/server/auth';
import { api } from '@/trpc/server';

import type { Metadata } from 'next';

export const revalidate = 3600;

type Props = {
  params: Promise<{
    userId: string;
  }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { userId } = await params;
  const trpc = await api();
  const user = await trpc.user.findById({
    id: userId,
  });

  return {
    title: `${user?.name}`,
  };
}

export default async function MemberSingleLayout({ params, children }: Props) {
  const { userId } = await params;
  const trpc = await api();
  const [user, session] = await Promise.all([
    trpc.user.findById({
      id: userId,
    }),
    getServerAuthSession(),
  ]);

  if (!user) {
    throw new Error('メンバーが見つかりませんでした');
  }

  return (
    <Container py={32}>
      <UserProfile user={user} isCurrentUser={session?.user.id === user.id} />
      <UserProfileTab userId={userId} />
      {children}
    </Container>
  );
}
