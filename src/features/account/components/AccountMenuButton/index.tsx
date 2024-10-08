'use client';

import React, { useCallback } from 'react';

import { Avatar, Menu, Skeleton, Tooltip, UnstyledButton } from '@mantine/core';
import { IconLogin, IconLogout, IconSettings, IconUser } from '@tabler/icons-react';
import Link from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react';

const AccountMenuButton: React.FC = () => {
  const { data: session, status } = useSession();

  const handleSignIn = useCallback(() => {
    void signIn('discord');
  }, []);

  const handleSignOut = useCallback(() => {
    void signOut();
  }, []);

  if (status === 'loading') {
    return <Skeleton w={38} h={38} circle />;
  }

  if (!session) {
    return (
      <Tooltip label="ログイン / プロフィール作成" openDelay={500}>
        <UnstyledButton aria-label="ログイン / プロフィール作成" onClick={handleSignIn}>
          <Avatar variant="filled" color="blue">
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
        <Menu.Item leftSection={<IconLogout size={14} />} onClick={handleSignOut}>
          ログアウト
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export default AccountMenuButton;
