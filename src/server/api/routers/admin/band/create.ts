import { z } from 'zod';

import { bandInputSchema } from '@/server/api/routers/admin/schemas';
import { adminProcedure } from '@/server/api/trpc';
import { revalidateEventPages } from '@/server/applications/services/revalidate-event-pages';

/** バンドを出演順の最後に追加する */
export const create = adminProcedure
  .input(z.object({ eventId: z.string(), data: bandInputSchema }))
  .mutation(async ({ ctx, input }) => {
    const band = await ctx.db.$transaction(async (tx) => {
      const { _max: max } = await tx.band.aggregate({
        where: { eventId: input.eventId },
        _max: { liveOrder: true },
      });
      return tx.band.create({
        data: {
          ...input.data,
          eventId: input.eventId,
          liveOrder: (max.liveOrder ?? 0) + 1,
        },
        select: { id: true },
      });
    });
    revalidateEventPages();
    return band;
  });
