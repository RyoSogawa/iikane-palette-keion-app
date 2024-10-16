'use client';

import React, { useMemo } from 'react';

import { ActionIcon, Menu } from '@mantine/core';
import {
  IconCaretDownFilled,
  IconHome,
  IconMicrophone2,
  IconUsersGroup,
} from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type MenuItem = {
  title: string;
  icon: React.ReactElement;
  pathname: string;
};

const MenuMap: Record<string, MenuItem> = {
  home: { title: 'Home', icon: <IconHome size={14} />, pathname: '/' },
  events: { title: 'イベント', icon: <IconMicrophone2 size={14} />, pathname: '/events' },
  users: { title: '部員名簿', icon: <IconUsersGroup size={14} />, pathname: '/members' },
};

const NavMenu: React.FC = () => {
  const currentPath = usePathname();

  const currentMenu = useMemo(() => {
    return Object.entries(MenuMap)
      .slice()
      .sort(([, a], [, b]) => {
        // パターンマッチをなるべく厳格にするために長いpathnameから優先的にfindする
        return b.pathname.length - a.pathname.length;
      })
      .find(([pageTitle, { pathname }]) => {
        // homeはパスがシンプルなので完全一致で判定
        if (pageTitle === 'home') {
          return currentPath === pathname;
        }
        // その他のページはサブディレクトリも含めて判定
        return currentPath.startsWith(pathname);
      })?.[1];
  }, [currentPath]);

  return (
    <Menu position="bottom-start" trigger="click-hover">
      <Menu.Target>
        <ActionIcon variant="light" color="gray" aria-label="ナビメニュー">
          {currentMenu?.icon ?? <IconCaretDownFilled size={14} />}
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        {Object.entries(MenuMap).map(([, { pathname, icon, title }]) => (
          <Menu.Item key={title} component={Link} leftSection={icon} href={pathname}>
            {title}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
};

export default NavMenu;
