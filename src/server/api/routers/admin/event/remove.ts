import { z } from 'zod';

import { revalidateEventPages } from '@/server/api/routers/admin/revalidate-event-pages';
import { adminProcedure } from '@/server/api/trpc';

/** イベントを削除する。バンド・メンバー・レク王は DB の Cascade で一緒に消える */
export const remove = adminProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ ctx, input }) => {
    await ctx.db.event.delete({ where: { id: input.id } });
    revalidateEventPages(input.id);
  });
