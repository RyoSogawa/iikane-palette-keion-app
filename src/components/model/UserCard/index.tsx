import React from 'react';

import { Avatar, Box, Group, Paper, Text, type PaperProps } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import Link from 'next/link';

import type { User } from '@prisma/client';

export type UserCardProps = Pick<PaperProps, 'bg' | 'withBorder'> & {
  user: Pick<User, 'id' | 'name' | 'nickname' | 'image'>;
};

const UserCard: React.FC<UserCardProps> = ({ user, ...props }) => {
  return (
    <Paper component={Link} href={`/members/${user.id}`} p="md" radius="md" {...props}>
      <Group>
        <Avatar src={user.image} alt={user.name ?? 'アバター'} />
        <Box flex={1}>
          <Text size="sm" fw={500} c="bright" truncate="end">
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
