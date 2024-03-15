'use client';

import React from 'react';

import { Grid, type GridProps, useMantineColorScheme } from '@mantine/core';

import UserCard, { type UserCardProps } from '@/components/model/UserCard';

export type UserCardListProps = GridProps & {
  users: UserCardProps['user'][];
};

const UserCardList: React.FC<UserCardListProps> = ({ users, ...props }) => {
  const { colorScheme } = useMantineColorScheme();
  return (
    <Grid {...props}>
      {users.map((user) => (
        <Grid.Col
          key={user.id}
          span={{
            base: 12,
            sm: 6,
            md: 4,
          }}
        >
          <UserCard
            user={user}
            bg={colorScheme === 'dark' ? 'dark' : 'white'}
            withBorder={colorScheme === 'light'}
          />
        </Grid.Col>
      ))}
    </Grid>
  );
};

export default UserCardList;
