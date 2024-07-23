'use client';

import React from 'react';

import {
  AppShell as MantineAppShell,
  Box,
  Container,
  Flex,
  Space,
  Title,
  Divider,
  Text,
} from '@mantine/core';
import Link from 'next/link';

import Footer from '@/components/application/Footer';
import NavMenu from '@/components/application/NavMenu';
import AccountMenuButton from '@/features/account/components/AccountMenuButton';

import s from './style.module.css';

export const HEADER_HEIGHT = 60;

export type AppShellProps = {
  children: React.ReactNode;
};

const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <MantineAppShell header={{ height: HEADER_HEIGHT }} padding="md">
      <MantineAppShell.Header>
        <Container px={20} h="100%">
          <Flex align="center" h="100%" gap={8}>
            <Box component={Link} href="/" td="none">
              <Title order={1} size="1rem" c="bright">
                いいかねパレット軽音部
              </Title>
            </Box>
            <Text c="dimmed">/</Text>
            <NavMenu />
            <Space flex={1} />
            <AccountMenuButton />
          </Flex>
        </Container>
      </MantineAppShell.Header>
      <div className={s.wrapper}>
        <MantineAppShell.Main className={s.main}>{children}</MantineAppShell.Main>
        <Divider mt="xl" />
        <Footer />
      </div>
    </MantineAppShell>
  );
};

export default AppShell;
