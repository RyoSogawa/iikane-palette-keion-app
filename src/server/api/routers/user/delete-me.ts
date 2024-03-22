import { protectedProcedure } from '@/server/api/trpc';

export const deleteMe = protectedProcedure.mutation(({ ctx }) => {
  return ctx.db.$transaction(async (tx) => {
    await tx.user.delete({
      where: {
        id: ctx.session.user.id,
      },
    });
  });
});
