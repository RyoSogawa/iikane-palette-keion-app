'use client';

import React from 'react';

import { Avatar, Menu, Skeleton, UnstyledButton } from '@mantine/core';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

const AccountMenuButton: React.FC = () => {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <Skeleton w={38} h={38} circle />;
  }

  if (!session) {
    return (
      <UnstyledButton component={Link} href="/api/auth/signin" aria-label="ログイン">
        <Avatar />
      </UnstyledButton>
    );
  }

  return (
    <Menu>
      <Menu.Target>
        <UnstyledButton aria-label="アカウントメニュー">
          <Avatar src={session.user.image} alt={session.user.name ?? 'アバター'} />
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item component={Link} href={`/members/${session.user.id}`}>
          プロフィール
        </Menu.Item>
        <Menu.Item component={Link} href="/api/auth/signout">
          ログアウト
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export default AccountMenuButton;
