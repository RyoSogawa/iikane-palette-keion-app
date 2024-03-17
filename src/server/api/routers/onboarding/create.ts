import { protectedProcedure } from '@/server/api/trpc';
import { OnboardingSchema } from '@/types/generated/zod';

const inputSchema = OnboardingSchema.pick({
  step: true,
});

export const create = protectedProcedure.input(inputSchema).mutation(({ ctx, input }) => {
  return ctx.db.onboarding.create({
    data: {
      userId: ctx.session.user.id,
      step: input.step,
    },
    select: {
      id: true,
      userId: true,
      step: true,
      createdAt: true,
    },
  });
});
