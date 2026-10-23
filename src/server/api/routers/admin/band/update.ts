import { z } from 'zod';

import { revalidateEventPages } from '@/server/api/routers/admin/revalidate-event-pages';
import { bandInputSchema } from '@/server/api/routers/admin/schemas';
import { adminProcedure } from '@/server/api/trpc';

export const update = adminProcedure
  .input(z.object({ id: z.string(), data: bandInputSchema }))
  .mutation(async ({ ctx, input }) => {
    const band = await ctx.db.band.update({
      where: { id: input.id },
      data: input.data,
      select: { eventId: true },
    });
    if (band.eventId) revalidateEventPages(band.eventId);
  });
