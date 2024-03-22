import { Container, Title } from '@mantine/core';

import SearchParamController from '@/components/functional/SearchParamController';
import OnboardingViewMyProfileModal from '@/components/model/OnboardingViewMyProfileModal';
import UserCardList from '@/components/model/UserCardList';
import { getServerAuthSession } from '@/server/auth';
import { api } from '@/trpc/server';

export default async function Home({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const [users, session] = await Promise.all([api.user.getAll.query(), getServerAuthSession()]);

  let shouldShowOnboarding = false;
  // ログイン後にTOPに飛ばされたときだけfetchさせる
  if (searchParams['login-callback'] === 'true' && session) {
    const onboarding = await api.onboarding.findByCurrentUser.query({
      step: 'VIEW_MY_PROFILE',
    });
    shouldShowOnboarding = !onboarding;
  }

  return (
    <Container py={16}>
      <Title order={2}>部員名簿</Title>
      <UserCardList users={users} mt={32} />
      {session && shouldShowOnboarding && <OnboardingViewMyProfileModal user={session.user} />}
      <SearchParamController paramsToRemove={['login-callback']} />
    </Container>
  );
}
