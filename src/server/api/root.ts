import { eventRouter } from '@/server/api/routers/event';
import { myBestSongsRouter } from '@/server/api/routers/my-best-songs';
import { onboardingRouter } from '@/server/api/routers/onboarding';
import { userRouter } from '@/server/api/routers/user';
import { userTagRouter } from '@/server/api/routers/user-tag';
import { createTRPCRouter } from '@/server/api/trpc';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  userTag: userTagRouter,
  onboarding: onboardingRouter,
  myBestSongs: myBestSongsRouter,
  event: eventRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
