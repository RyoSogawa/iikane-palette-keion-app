import React from 'react';

import { Avatar, Box, Button, Container, Divider, Flex, Space, Text, Title } from '@mantine/core';
import { type User } from '@prisma/client';
import { IconEdit, IconMapPin } from '@tabler/icons-react';
import Link from 'next/link';

import SnsLinks from '@/components/model/UserProfile/parts/SnsLinks';

export type UserProfileProps = {
  user: Omit<User, 'createdAt' | 'email' | 'emailVerified'>;
  showsEditButton?: boolean;
};

const UserProfile: React.FC<UserProfileProps> = ({ user, showsEditButton }) => {
  return (
    <Container pos="relative" py={32}>
      {showsEditButton && (
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
      <Avatar src={user.image} alt={user.name ?? 'アバター'} size={80} />
      <Box mt="md">
        <Title order={1} size="h2">
          {user.name}
        </Title>
        {user.nickname && (
          <Text c="dimmed" fz="xs" mt="xs">
            {user.nickname}
          </Text>
        )}
        {user.residence && (
          <Flex mt="xs" c="dimmed" fz="xs" align="center" gap={4}>
            <IconMapPin size={16} />
            {user.residence}
          </Flex>
        )}
      </Box>
      <SnsLinks user={user} mt="md" />
      <Divider mt={16} />
      {user.introduction && (
        <Box
          mt={16}
          dangerouslySetInnerHTML={{
            __html: user.introduction,
          }}
        />
      )}
    </Container>
  );
};

export default UserProfile;
