import { z } from 'zod';

import { adminProcedure } from '@/server/api/trpc';
import { revalidateEventPages } from '@/server/applications/services/revalidate-event-pages';

/** バンドを削除する。メンバーは DB の Cascade で一緒に消える */
export const remove = adminProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ ctx, input }) => {
    const band = await ctx.db.band.delete({
      where: { id: input.id },
      select: { eventId: true },
    });
    if (band.eventId) revalidateEventPages(band.eventId);
  });
