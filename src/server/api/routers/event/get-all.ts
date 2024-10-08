import { publicProcedure } from '@/server/api/trpc';

export const getAll = publicProcedure.query(({ ctx }) => {
  return ctx.db.event.findMany({
    select: {
      id: true,
      name: true,
      image: true,
      dateFrom: true,
      dateTo: true,
      description: true,
    },
    orderBy: {
      dateFrom: 'desc',
    },
  });
});
