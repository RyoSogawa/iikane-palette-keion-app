'use client';

import React from 'react';

import { Avatar, Menu, Skeleton, Tooltip, UnstyledButton } from '@mantine/core';
import { IconLogin } from '@tabler/icons-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

import CurrentUserAvatar from '@/components/model/CurrentUserAvatar';

const AccountMenuButton: React.FC = () => {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <Skeleton w={38} h={38} circle />;
  }

  if (!session) {
    return (
      <Tooltip label="ログイン">
        <UnstyledButton component={Link} href="/api/auth/signin" aria-label="ログイン">
          <Avatar>
            <IconLogin />
          </Avatar>
        </UnstyledButton>
      </Tooltip>
    );
  }

  return (
    <Menu position="bottom-end">
      <Menu.Target>
        <UnstyledButton aria-label="アカウントメニュー">
          <CurrentUserAvatar src={session.user.image} alt={session.user.name ?? 'アバター'} />
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
