import { z } from 'zod';

import { adminProcedure } from '@/server/api/trpc';
import { revalidateEventPages } from '@/server/applications/services/revalidate-event-pages';

/** 公開・非公開（下書き）を切り替える */
export const setDraft = adminProcedure
  .input(z.object({ id: z.string(), isDraft: z.boolean() }))
  .mutation(async ({ ctx, input }) => {
    await ctx.db.event.update({
      where: { id: input.id },
      data: { isDraft: input.isDraft },
    });
    revalidateEventPages();
  });
