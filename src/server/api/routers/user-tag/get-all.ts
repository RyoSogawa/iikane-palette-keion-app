import { publicProcedure } from '@/server/api/trpc';

export const getAll = publicProcedure.query(({ ctx }) => {
  return ctx.db.userTag.findMany({
    select: {
      id: true,
      name: true,
      createdAt: true,
    },
  });
});
