import React from 'react';

import { Avatar, Box, Group, Paper, Text } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import Link from 'next/link';

import type { User } from '@prisma/client';

export type UserCardProps = {
  user: Pick<User, 'id' | 'name' | 'nickname' | 'image'>;
};

const UserCard: React.FC<UserCardProps> = ({ user }) => {
  return (
    <Paper component={Link} href={`/members/${user.id}`} p="md" radius="md" bg="dark">
      <Group>
        <Avatar src={user.image} alt={user.name ?? 'アバター'} />
        <Box flex={1}>
          <Text size="sm" fw={500} c="white" truncate="end">
            {user.name}
          </Text>
          {user.nickname && (
            <Text c="dimmed" size="xs" truncate="end">
              {user.nickname}
            </Text>
          )}
        </Box>
        <IconChevronRight stroke={1.5} size={18} color="gray" />
      </Group>
    </Paper>
  );
};

export default UserCard;
