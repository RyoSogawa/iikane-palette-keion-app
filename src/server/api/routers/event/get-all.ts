import { publishedEventWhere } from '@/server/api/routers/event/published';
import { publicProcedure } from '@/server/api/trpc';

export const getAll = publicProcedure.query(({ ctx }) => {
  return ctx.db.event.findMany({
    where: publishedEventWhere,
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
