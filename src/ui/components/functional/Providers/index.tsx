'use client';

import React from 'react';

import { createTheme, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { SessionProvider } from 'next-auth/react';

import { TRPCReactProvider } from '@/trpc/react';

const theme = createTheme({});

export type ProvidersProps = {
  children: React.ReactNode;
};

const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <TRPCReactProvider>
      <SessionProvider>
        <MantineProvider theme={theme} defaultColorScheme="dark">
          <Notifications />
          {children}
        </MantineProvider>
      </SessionProvider>
    </TRPCReactProvider>
  );
};

export default Providers;
