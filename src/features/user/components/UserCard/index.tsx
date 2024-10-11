'use client';

import React from 'react';

import { Avatar, Box, Group, Paper, Text } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import Link from 'next/link';

import RecreationKingBadge from '@/features/event/components/RecreationKingBadge';

import type { UserTag, Event } from '@/types/generated/zod';
import type { User } from '@prisma/client';

export type UserCardProps = {
  user: Pick<User, 'id' | 'name' | 'image'> & {
    tags: Array<{
      userTag: Pick<UserTag, 'name'>;
    }>;
    recreationKingEvents: Array<{
      event: Pick<Event, 'id' | 'name'>;
    }>;
  };
};

const UserCard: React.FC<UserCardProps> = ({ user }) => {
  return (
    <Paper component={Link} href={`/members/${user.id}/profile`} p="md" h="100%" bg="dark">
      <Group h="100%">
        <Box pos="relative">
          <Avatar
            src={user.image}
            alt={user.name ?? ''}
            imageProps={{ loading: 'lazy' }}
            bg="gray"
          />
        </Box>
        <Box flex={1}>
          <Text size="sm" fw={500} c="bright" truncate="end">
            {user.name}
            <RecreationKingBadge
              recreationKingEvents={user.recreationKingEvents}
              size={18}
              ml={4}
              mt={-4}
              style={{
                verticalAlign: 'middle',
              }}
            />
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
