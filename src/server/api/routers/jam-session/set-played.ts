import { protectedProcedure } from '@/server/api/trpc';

import { assertActiveParticipant, findSongOrThrow } from './procedures';
import { setPlayedInputSchema } from './schemas';

/** 曲を演奏済みにする・戻す。その曲のセッションに参加中なら誰でもできる */
export const setPlayed = protectedProcedure
  .input(setPlayedInputSchema)
  .mutation(async ({ ctx, input }) => {
    const song = await findSongOrThrow(ctx.db, input.songId);
    await assertActiveParticipant(ctx.db, song.sessionId, ctx.session.user.id);

    await ctx.db.jamSessionSong.update({
      where: { id: input.songId },
      data: { playedAt: input.played ? new Date() : null },
    });
  });
