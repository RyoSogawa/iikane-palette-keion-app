import React from 'react';

import { Avatar, Paper, Title } from '@mantine/core';
import Link from 'next/link';

import type { User } from '@prisma/client';

export type UserCardProps = {
  user: Pick<User, 'id' | 'name' | 'nickname' | 'image'>;
};

const UserCard: React.FC<UserCardProps> = ({ user }) => {
  return (
    <Paper component={Link} href={`/members/${user.id}`} p="lg" radius="md" withBorder>
      <Avatar src={user.image} alt={user.name ?? 'アバター'} mx="auto" size={120} />
      <Title order={2} ta="center" fz="lg" fw={500} mt="md">
        {user.name}
        {user.nickname && `(${user.nickname})`}
      </Title>
    </Paper>
  );
};

export default UserCard;
