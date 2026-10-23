import { z } from 'zod';

import { revalidateEventPages } from '@/server/api/routers/admin/revalidate-event-pages';
import { adminProcedure } from '@/server/api/trpc';

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
