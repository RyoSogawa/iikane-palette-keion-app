import React from 'react';

import { Container, Title } from '@mantine/core';
import { redirect } from 'next/navigation';

import { getServerAuthSession } from '@/server/auth';
import AccountDeleteModalButton from 'src/components/model/AccountDeleteModalButton';

export default async function AccountSettingPage() {
  const session = await getServerAuthSession();

  if (!session) {
    redirect('/');
  }

  return (
    <Container py={16}>
      <Title order={2} mb={40}>
        アカウント設定
      </Title>
      <AccountDeleteModalButton />
    </Container>
  );
}
