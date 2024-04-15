import React from 'react';

import { Avatar, Box, Flex, Text, Title } from '@mantine/core';
import { type User } from '@prisma/client';
import { IconMapPin } from '@tabler/icons-react';

import YourProfileAlert from '@/features/user/components/UserProfile/parts/YourProfileAlert';
import { type UserTag } from '@/types/generated/zod';

import SnsLinks from './parts/SnsLinks';

export type UserProfileProps = {
  user: Omit<User, 'createdAt' | 'email' | 'emailVerified'> & {
    tags: Array<{
      userTag: Pick<UserTag, 'name'>;
    }>;
  };
  isCurrentUser?: boolean;
};

const UserProfile: React.FC<UserProfileProps> = ({ user, isCurrentUser }) => {
  return (
    <Box pos="relative">
      {isCurrentUser && <YourProfileAlert userId={user.id} />}
      <Avatar
        src={user.image}
        alt={user.name ?? 'アバター'}
        size={80}
        mx="auto"
        imageProps={{ loading: 'lazy' }}
        bg="gray"
      />
      <Box mt="md">
        <Title order={1} size="h2" ta="center">
          {user.name}
        </Title>
        {user.nickname && (
          <Text c="dimmed" fz="xs" ta="center">
            {user.nickname}
          </Text>
        )}
        {user.residence && (
          <Flex mt="xs" c="dimmed" fz="xs" align="center" gap={4} justify="center">
            <IconMapPin size={16} />
            {user.residence}
          </Flex>
        )}
      </Box>
      <Flex wrap="wrap" gap="sm" mt="md" justify="center">
        {user.tags?.map(({ userTag }) => (
          <Text key={userTag.name} fz="xs">
            #{userTag.name}
          </Text>
        ))}
      </Flex>
      <SnsLinks user={user} mt="md" justify="center" />
    </Box>
  );
};

export default UserProfile;
