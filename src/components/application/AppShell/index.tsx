'use client';

import React from 'react';

import {
  AppShell as MantineAppShell,
  Box,
  Text,
  Container,
  Flex,
  Space,
  Title,
  Divider,
} from '@mantine/core';
import Link from 'next/link';

import AccountMenuButton from '@/components/model/AccountMenuButton';
import { LINK } from '@/constants/external-service';

import s from './style.module.css';

export type AppShellProps = {
  children: React.ReactNode;
};

const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <MantineAppShell header={{ height: 60 }} padding="md">
      <MantineAppShell.Header>
        <Container px={20} h="100%">
          <Flex align="center" h="100%">
            <Box component={Link} href="/" td="none">
              <Title order={1} size="1rem" c="bright">
                いいかねパレット軽音部
              </Title>
            </Box>
            <Space flex={1} />
            <AccountMenuButton />
          </Flex>
        </Container>
      </MantineAppShell.Header>
      <div className={s.wrapper}>
        <MantineAppShell.Main className={s.main}>{children}</MantineAppShell.Main>
        <Divider />
        <Box component="footer" p="xs">
          <Container>
            <Flex align="center" gap="sm">
              <Text fz="xs">&copy; ぱおん</Text>
              <Space flex={1} />
              <Link href={LINK.SUZURI} target="_blank" rel="noreferrer">
                SUZURI
              </Link>
              <Link href={LINK.GITHUB} target="_blank" rel="noreferrer">
                GitHub
              </Link>
            </Flex>
          </Container>
        </Box>
      </div>
    </MantineAppShell>
  );
};

export default AppShell;
