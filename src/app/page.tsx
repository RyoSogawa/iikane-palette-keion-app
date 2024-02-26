import { Container, Title } from '@mantine/core';
import { unstable_noStore as noStore } from 'next/cache';

import UserCardList from '@/components/model/UserCardList';
import { api } from '@/trpc/server';

export default async function Home() {
  noStore();
  const users = await api.user.getAll.query();

  return (
    <Container component="main" py={16}>
      <Title order={2}>部員名簿</Title>
      <UserCardList users={users} mt={32} />
    </Container>
  );
}
