import React from 'react';

import { Avatar, Paper, Text, Title } from '@mantine/core';
import Link from 'next/link';

import type { User } from '@prisma/client';

export type UserCardProps = {
  user: Pick<User, 'id' | 'name' | 'nickname' | 'image'>;
};

const UserCard: React.FC<UserCardProps> = ({ user }) => {
  return (
    <Paper component={Link} href={`/members/${user.id}`} p="lg" radius="md" withBorder>
      <Avatar
        src={user.image}
        alt={user.name ?? 'アバター'}
        mx="auto"
        // Mantineのバグっぽい？
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        size={{
          base: 60,
          md: 120,
        }}
      />
      <Title order={2} ta="center" fz="lg" c="white" fw={500} mt="md">
        {user.name}
      </Title>
      {user.nickname && (
        <Text ta="center" c="dimmed" fz="sm" mt={8}>
          {user.nickname}
        </Text>
      )}
    </Paper>
  );
};

export default UserCard;
