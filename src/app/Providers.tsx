import React from 'react';

import { createTheme, MantineProvider } from '@mantine/core';

import { TRPCReactProvider } from '@/trpc/react';

const theme = createTheme({
  primaryColor: 'grape',
});

export type ProvidersProps = {
  children: React.ReactNode;
};

const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <TRPCReactProvider>
      <MantineProvider theme={theme} defaultColorScheme="dark">
        {children}
      </MantineProvider>
    </TRPCReactProvider>
  );
};

export default Providers;