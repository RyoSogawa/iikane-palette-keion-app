'use client';

import React from 'react';

import { Burger, AppShell as MantineAppShell } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

export type AppShellProps = {
  children: React.ReactNode;
};

const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [opened, { toggle }] = useDisclosure();

  return (
    <MantineAppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <MantineAppShell.Header>
        <Burger opened={opened} hiddenFrom="sm" size="sm" onClick={toggle} />
        <div>Logo</div>
      </MantineAppShell.Header>

      <MantineAppShell.Navbar p="md">Navbar</MantineAppShell.Navbar>

      <MantineAppShell.Main>{children}</MantineAppShell.Main>
    </MantineAppShell>
  );
};

export default AppShell;
