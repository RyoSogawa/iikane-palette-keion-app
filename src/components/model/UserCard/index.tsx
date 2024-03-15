import React from 'react';

import { Avatar, Box, Group, Paper, Text, type PaperProps } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import Link from 'next/link';

import type { UserTag } from '@/types/generated/zod';
import type { User } from '@prisma/client';

export type UserCardProps = Pick<PaperProps, 'bg' | 'withBorder'> & {
  user: Pick<User, 'id' | 'name' | 'image'> & {
    tags: Array<{
      userTag: Pick<UserTag, 'name'>;
    }>;
  };
};

const UserCard: React.FC<UserCardProps> = ({ user, ...props }) => {
  return (
    <Paper component={Link} href={`/members/${user.id}`} p="md" {...props}>
      <Group>
        <Avatar src={user.image} alt={user.name ?? 'アバター'} />
        <Box flex={1}>
          <Text size="sm" fw={500} c="bright" truncate="end">
            {user.name}
          </Text>
          <Text mt={4} lineClamp={1} c="dimmed" fz="xs">
            {user.tags?.map(({ userTag }) => (
              <Text key={userTag.name} fz="inherit" mr={4} span>
                #{userTag.name}
              </Text>
            ))}
          </Text>
        </Box>
        <IconChevronRight stroke={1.5} size={18} color="gray" />
      </Group>
    </Paper>
  );
};

export default UserCard;
