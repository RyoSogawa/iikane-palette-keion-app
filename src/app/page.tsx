import { Container, Title } from '@mantine/core';

import OnboardingViewMyProfileModal from '@/components/model/OnboardingViewMyProfileModal';
import UserCardList from '@/components/model/UserCardList';
import { api } from '@/trpc/server';

export default async function Home() {
  const [users] = await Promise.all([api.user.getAll.query()]);

  return (
    <Container py={16}>
      <Title order={2}>部員名簿</Title>
      <UserCardList users={users} mt={32} />
      <OnboardingViewMyProfileModal />
    </Container>
  );
}
