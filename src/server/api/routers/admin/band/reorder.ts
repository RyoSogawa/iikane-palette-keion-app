import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { adminProcedure } from '@/server/api/trpc';
import { revalidateEventPages } from '@/server/applications/services/revalidate-event-pages';

/** 出演順を、渡されたバンド ID の並びどおりに 1 から振り直す */
export const reorder = adminProcedure
  .input(z.object({ eventId: z.string(), bandIds: z.array(z.string()).max(100) }))
  .mutation(async ({ ctx, input }) => {
    await ctx.db.$transaction(async (tx) => {
      const bands = await tx.band.findMany({
        where: { eventId: input.eventId },
        select: { id: true },
      });
      const current = new Set(bands.map((band) => band.id));
      const isSameSet =
        current.size === input.bandIds.length &&
        new Set(input.bandIds).size === input.bandIds.length &&
        input.bandIds.every((id) => current.has(id));
      // 並び替えの途中で他の管理者がバンドを増減していたら、古い並びで上書きしない
      if (!isSameSet) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'バンドの一覧が変わっています。画面を読み込み直してください',
        });
      }
      await Promise.all(
        input.bandIds.map((id, index) =>
          tx.band.update({ where: { id }, data: { liveOrder: index + 1 } }),
        ),
      );
    });
    revalidateEventPages(input.eventId);
  });
