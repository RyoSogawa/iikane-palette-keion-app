import { adminProcedure } from '@/server/api/trpc';

export const list = adminProcedure.query(({ ctx }) => {
  return ctx.db.event.findMany({
    select: {
      id: true,
      name: true,
      dateFrom: true,
      dateTo: true,
      isDraft: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { Band: true } },
    },
    orderBy: {
      dateFrom: 'desc',
    },
  });
});
