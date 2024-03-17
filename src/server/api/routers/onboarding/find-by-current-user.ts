import { protectedProcedure } from '@/server/api/trpc';
import { OnboardingSchema } from '@/types/generated/zod';

const inputSchema = OnboardingSchema.pick({
  step: true,
});

export const findByCurrentUser = protectedProcedure.input(inputSchema).query(({ ctx, input }) => {
  return ctx.db.onboarding.findFirst({
    where: {
      userId: ctx.session.user.id,
      step: input.step,
    },
    select: {
      id: true,
      step: true,
      createdAt: true,
    },
  });
});
