import React, { useCallback } from 'react';

import { Button, Paper, Space, Text } from '@mantine/core';
import { IconLogin } from '@tabler/icons-react';
import { signIn, useSession } from 'next-auth/react';

const LoginLink: React.FC = () => {
  const { status } = useSession();

  const handleSignIn = useCallback(() => {
    void signIn('discord');
  }, []);

  if (status !== 'unauthenticated') return null;

  return (
    <Paper ta="center" shadow="xs" p="xl" mb="xl" variant="" bg="dark" withBorder>
      <Text size="sm">Discordに参加済みの方はこちら</Text>
      <Space h={16} />
      <Button leftSection={<IconLogin size={18} />} onClick={handleSignIn}>
        ログイン / プロフィール作成
      </Button>
    </Paper>
  );
};

export default LoginLink;
