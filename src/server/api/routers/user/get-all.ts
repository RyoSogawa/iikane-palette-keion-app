import { publicProcedure } from '@/server/api/trpc';

export const getAll = publicProcedure.query(({ ctx }) => {
  return ctx.db.user.findMany({
    select: {
      id: true,
      name: true,
      image: true,
      tags: {
        select: {
          userTag: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      recreationKingEvents: {
        select: {
          event: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
});
