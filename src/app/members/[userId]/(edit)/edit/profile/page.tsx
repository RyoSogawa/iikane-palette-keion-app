import React from 'react';

import UserForm from '@/features/user/components/UserForm';
import { api } from '@/trpc/server';

type Props = {
  params: Promise<{
    userId: string;
  }>;
};

export default async function MemberEditPage({ params }: Props) {
  const { userId } = await params;
  const trpc = await api();
  const [user, tags] = await Promise.all([
    trpc.user.findById({
      id: userId,
    }),
    trpc.userTag.getAll(),
  ]);

  if (!user) {
    throw new Error('メンバーが見つかりませんでした');
  }

  const userFormValues = {
    ...user,
    tags: user.tags.map((tag) => tag.userTag.name),
  };

  return <UserForm user={userFormValues} tags={tags} />;
}
