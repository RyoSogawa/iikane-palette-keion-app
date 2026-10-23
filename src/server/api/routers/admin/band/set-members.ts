import { z } from 'zod';

import { membersInputSchema } from '@/server/api/routers/admin/schemas';
import { adminProcedure } from '@/server/api/trpc';
import { revalidateEventPages } from '@/server/applications/services/revalidate-event-pages';

/** バンドのメンバーを、渡された一覧で置き換える。配列の順番がそのまま表示順になる */
export const setMembers = adminProcedure
  .input(z.object({ bandId: z.string(), members: membersInputSchema }))
  .mutation(async ({ ctx, input }) => {
    const band = await ctx.db.$transaction(async (tx) => {
      await tx.userOnBand.deleteMany({ where: { bandId: input.bandId } });
      await tx.userOnBand.createMany({
        data: input.members.map((member, index) => ({
          ...member,
          bandId: input.bandId,
          order: index + 1,
        })),
      });
      return tx.band.findUniqueOrThrow({
        where: { id: input.bandId },
        select: { eventId: true },
      });
    });
    if (band.eventId) revalidateEventPages(band.eventId);
  });
