import React from 'react';

import { Avatar, Box, Button, Container, Divider, Flex, Space, Text, Title } from '@mantine/core';
import { type User } from '@prisma/client';
import { IconEdit, IconMapPin } from '@tabler/icons-react';
import Link from 'next/link';

import CurrentUserAvatar from '@/components/model/CurrentUserAvatar';
import SnsLinks from '@/components/model/UserProfile/parts/SnsLinks';
import { type UserTag } from '@/types/generated/zod';

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
    <Container pos="relative" py={32}>
      {isCurrentUser && (
        <Button
          component={Link}
          href={`/members/${user.id}/edit`}
          variant="outline"
          pos="absolute"
          right={32}
          top={32}
        >
          <IconEdit size={18} />
          <Space w={4} />
          編集
        </Button>
      )}
      {isCurrentUser ? (
        <CurrentUserAvatar
          src={user.image}
          alt={user.name ?? 'アバター'}
          size={80}
          mx={{ base: 'unset', sm: 'auto' }}
        />
      ) : (
        <Avatar
          src={user.image}
          alt={user.name ?? 'アバター'}
          size={80}
          mx={{ base: 'unset', sm: 'auto' }}
        />
      )}
      <Box mt="md">
        <Title order={1} size="h2" ta={{ base: 'left', sm: 'center' }}>
          {user.name}
        </Title>
        {user.nickname && (
          <Text c="dimmed" fz="xs" ta={{ base: 'left', sm: 'center' }}>
            {user.nickname}
          </Text>
        )}
        {user.residence && (
          <Flex
            mt="xs"
            c="dimmed"
            fz="xs"
            align="center"
            gap={4}
            justify={{ base: 'flex-start', sm: 'center' }}
          >
            <IconMapPin size={16} />
            {user.residence}
          </Flex>
        )}
      </Box>
      <Flex wrap="wrap" gap="sm" mt="md" justify={{ base: 'flex-start', sm: 'center' }}>
        {user.tags?.map(({ userTag }) => (
          <Text key={userTag.name} fz="xs">
            #{userTag.name}
          </Text>
        ))}
      </Flex>
      <SnsLinks user={user} mt="md" justify={{ base: 'flex-start', sm: 'center' }} />
      <Divider mt={32} />
      {user.introduction && (
        <Box
          mt={32}
          mx={{ base: 0, sm: 32 }}
          dangerouslySetInnerHTML={{
            __html: user.introduction,
          }}
        />
      )}
    </Container>
  );
};

export default UserProfile;
