import { TRPCError } from '@trpc/server';

import { protectedProcedure } from '@/server/api/trpc';

import { canManageSession, findSessionOrThrow, findSongOrThrow } from './guards';
import { songIdInputSchema } from './schemas';

/** 曲を消せるのは、挙げた本人と、セッションを作った人と、管理者 */
export const deleteSong = protectedProcedure
  .input(songIdInputSchema)
  .mutation(async ({ ctx, input }) => {
    const song = await findSongOrThrow(ctx.db, input.songId);
    const { user } = ctx.session;
    if (song.proposerId !== user.id) {
      const session = await findSessionOrThrow(ctx.db, song.sessionId);
      if (!canManageSession(session, user)) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
    }

    // 2 人がほぼ同時に消しても後の方を失敗させないよう、件数で結果を見る deleteMany を使う
    await ctx.db.jamSessionSong.deleteMany({ where: { id: input.songId } });
  });
