import { z } from 'zod';

import { eventInputSchema } from '@/server/api/routers/admin/schemas';
import { adminProcedure } from '@/server/api/trpc';
import { revalidateEventPages } from '@/server/applications/services/revalidate-event-pages';

export const update = adminProcedure
  .input(z.object({ id: z.string(), data: eventInputSchema }))
  .mutation(async ({ ctx, input }) => {
    await ctx.db.event.update({
      where: { id: input.id },
      data: input.data,
    });
    revalidateEventPages(input.id);
  });
