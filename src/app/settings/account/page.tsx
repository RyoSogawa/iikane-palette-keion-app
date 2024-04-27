import React from 'react';

import { Container, Title } from '@mantine/core';
import { redirect } from 'next/navigation';

import { SITE_NAME } from '@/constants/site-info';
import AccountDeleteModalButton from '@/features/account/components/AccountDeleteModalButton';
import { getServerAuthSession } from '@/server/auth';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: `アカウント設定 | ${SITE_NAME}`,
};

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
