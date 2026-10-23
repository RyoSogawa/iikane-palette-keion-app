import { z } from 'zod';

import { revalidateEventPages } from '@/server/api/routers/admin/revalidate-event-pages';
import { adminProcedure } from '@/server/api/trpc';

/** レク王を指定したユーザーの一覧で置き換える */
export const setRecreationKings = adminProcedure
  .input(z.object({ eventId: z.string(), userIds: z.array(z.string()).max(50) }))
  .mutation(async ({ ctx, input }) => {
    const userIds = [...new Set(input.userIds)];
    await ctx.db.$transaction([
      ctx.db.recreationKingUserOnEvent.deleteMany({ where: { eventId: input.eventId } }),
      ctx.db.recreationKingUserOnEvent.createMany({
        data: userIds.map((userId) => ({ eventId: input.eventId, userId })),
      }),
    ]);
    revalidateEventPages(input.eventId);
  });
