import { Container, Title } from '@mantine/core';

import OnboardingViewMyProfileModal from '@/features/account/components/OnboardingViewMyProfileModal';
import UserCardList from '@/features/user/components/UserCardList';
import { getServerAuthSession } from '@/server/auth';
import { api } from '@/trpc/server';
import SearchParamController from '@/ui/components/functional/SearchParamController';

import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: '部員名簿',
};

export default async function Members({
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
      {session && (
        <OnboardingViewMyProfileModal user={session.user} autoOpen={shouldShowOnboarding} />
      )}
      <SearchParamController paramsToRemove={['login-callback']} />
    </Container>
  );
}
