import React from 'react';

import { Box, Title } from '@mantine/core';

import UserForm from '@/features/user/components/UserForm';
import { api } from '@/trpc/server';

type Props = {
  params: {
    userId: string;
  };
};

export default async function MemberEditPage({ params }: Props) {
  const [user, tags] = await Promise.all([
    api.user.findById.query({
      id: params.userId,
    }),
    api.userTag.getAll.query(),
  ]);

  if (!user) {
    throw new Error('メンバーが見つかりませんでした');
  }

  const userFormValues = {
    ...user,
    tags: user.tags.map((tag) => tag.userTag.name),
  };

  return (
    <Box>
      <Title order={1} mt={40} mb={32}>
        プロフィール編集
      </Title>
      <UserForm user={userFormValues} tags={tags} />
    </Box>
  );
}
