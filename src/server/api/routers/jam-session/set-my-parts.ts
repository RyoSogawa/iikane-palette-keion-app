import { TRPCError } from '@trpc/server';

import { activeParticipantProcedure } from './procedures';
import { setMyPartsInputSchema } from './schemas';

/** ある曲の自分のパート一式を置き換える。空なら取り下げ。ほかの人の挙手には触らない */
export const setMyParts = activeParticipantProcedure
  .input(setMyPartsInputSchema)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;
    const song = await ctx.db.jamSessionSong.findUnique({
      where: { id: input.songId },
      select: { id: true },
    });
    if (!song) {
      throw new TRPCError({ code: 'NOT_FOUND' });
    }

    await ctx.db.$transaction([
      ctx.db.jamSessionEntry.deleteMany({ where: { songId: input.songId, userId } }),
      ctx.db.jamSessionEntry.createMany({
        data: input.parts.map((part) => ({
          songId: input.songId,
          userId,
          part,
          partNote: part === 'other' ? input.partNote : null,
        })),
      }),
    ]);
  });
