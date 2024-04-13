'use client';

import React from 'react';

import { Avatar, Menu, Skeleton, Tooltip, UnstyledButton } from '@mantine/core';
import { IconLogin, IconLogout, IconSettings, IconUser } from '@tabler/icons-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

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
    <Menu position="bottom-end" trigger="click-hover">
      <Menu.Target>
        <UnstyledButton aria-label="アカウントメニュー">
          <Avatar
            src={session.user.image}
            alt={session.user.name ?? 'アバター'}
            imageProps={{ loading: 'lazy' }}
          />
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          component={Link}
          href={`/members/${session.user.id}/profile`}
          leftSection={<IconUser size={14} />}
        >
          プロフィール
        </Menu.Item>
        <Menu.Item
          component={Link}
          href="/settings/account"
          leftSection={<IconSettings size={14} />}
        >
          アカウント設定
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item component={Link} href="/api/auth/signout" leftSection={<IconLogout size={14} />}>
          ログアウト
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export default AccountMenuButton;
