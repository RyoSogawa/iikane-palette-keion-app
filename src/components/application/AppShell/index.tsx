'use client';

import React from 'react';

import { AppShell as MantineAppShell, Container, Flex, Space, Title } from '@mantine/core';
import Link from 'next/link';

import AccountMenuButton from '@/components/model/AccountMenuButton';

export type AppShellProps = {
  children: React.ReactNode;
};

const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <MantineAppShell header={{ height: 60 }} padding="md">
      <MantineAppShell.Header>
        <Container px={20} h="100%">
          <Flex align="center" h="100%">
            <Link href="/">
              <Title order={1} size="1rem" c="bright">
                いいかねパレット軽音部
              </Title>
            </Link>
            <Space flex={1} />
            <AccountMenuButton />
          </Flex>
        </Container>
      </MantineAppShell.Header>
      <MantineAppShell.Main>{children}</MantineAppShell.Main>
    </MantineAppShell>
  );
};

export default AppShell;
