import { TRPCError } from '@trpc/server';

import { activeParticipantProcedure } from './procedures';
import { setPlayedInputSchema } from './schemas';

/** 曲を演奏済みにする・戻す。参加中なら誰でもできる */
export const setPlayed = activeParticipantProcedure
  .input(setPlayedInputSchema)
  .mutation(async ({ ctx, input }) => {
    const { count } = await ctx.db.jamSessionSong.updateMany({
      where: { id: input.songId },
      data: { playedAt: input.played ? new Date() : null },
    });
    if (count === 0) {
      throw new TRPCError({ code: 'NOT_FOUND' });
    }
  });
