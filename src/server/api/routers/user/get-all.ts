import { publicProcedure } from '@/server/api/trpc';

export const getAll = publicProcedure.query(({ ctx }) => {
  return ctx.db.user.findMany({
    select: {
      id: true,
      name: true,
      nickname: true,
      introduction: true,
      image: true,
    },
  });
});
