import { z } from 'zod';

import { bandInputSchema } from '@/server/api/routers/admin/schemas';
import { adminProcedure } from '@/server/api/trpc';
import { revalidateEventPages } from '@/server/applications/services/revalidate-event-pages';

export const update = adminProcedure
  .input(z.object({ id: z.string(), data: bandInputSchema }))
  .mutation(async ({ ctx, input }) => {
    await ctx.db.band.update({ where: { id: input.id }, data: input.data });
    revalidateEventPages();
  });
