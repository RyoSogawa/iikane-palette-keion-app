import { create } from '@/server/api/routers/onboarding/create';
import { findByCurrentUser } from '@/server/api/routers/onboarding/find-by-current-user';
import { createTRPCRouter } from '@/server/api/trpc';

export const onboardingRouter = createTRPCRouter({
  findByCurrentUser,
  create,
});
