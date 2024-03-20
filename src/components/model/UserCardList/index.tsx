'use client';

import React from 'react';

import { Grid, type GridProps } from '@mantine/core';

import UserCard, { type UserCardProps } from '@/components/model/UserCard';

export type UserCardListProps = GridProps & {
  users: UserCardProps['user'][];
  currentUserId?: string;
};

const UserCardList: React.FC<UserCardListProps> = ({ users, currentUserId, ...props }) => {
  return (
    <Grid {...props} align="stretch">
      {users.map((user) => (
        <Grid.Col
          key={user.id}
          span={{
            base: 12,
            sm: 6,
            md: 4,
          }}
        >
          <UserCard user={user} isCurrentUser={user.id === currentUserId} />
        </Grid.Col>
      ))}
    </Grid>
  );
};

export default UserCardList;
