import { Container, Title } from '@mantine/core';

import UserCardList from '@/components/model/UserCardList';
import { getServerAuthSession } from '@/server/auth';
import { api } from '@/trpc/server';

export default async function Home() {
  const [users, session] = await Promise.all([api.user.getAll.query(), getServerAuthSession()]);

  return (
    <Container py={16}>
      <Title order={2}>部員名簿</Title>
      <UserCardList users={users} mt={32} currentUserId={session?.user.id} />
    </Container>
  );
}
