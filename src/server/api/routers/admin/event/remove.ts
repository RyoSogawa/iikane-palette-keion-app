import { z } from 'zod';

import { adminProcedure } from '@/server/api/trpc';
import { revalidateEventPages } from '@/server/applications/services/revalidate-event-pages';

/** イベントを削除する。バンド・メンバー・レク王は DB の Cascade で一緒に消える */
export const remove = adminProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ ctx, input }) => {
    await ctx.db.event.delete({ where: { id: input.id } });
    revalidateEventPages();
  });
