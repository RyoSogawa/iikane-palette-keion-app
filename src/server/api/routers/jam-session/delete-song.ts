import { TRPCError } from '@trpc/server';

import { protectedProcedure } from '@/server/api/trpc';

import { songIdInputSchema } from './schemas';

/** 曲を消せるのは挙げた本人と管理者だけ。提案者が退会した曲は管理者だけが消せる */
export const deleteSong = protectedProcedure
  .input(songIdInputSchema)
  .mutation(async ({ ctx, input }) => {
    const song = await ctx.db.jamSessionSong.findUnique({
      where: { id: input.songId },
      select: { id: true, proposerId: true },
    });
    if (!song) {
      throw new TRPCError({ code: 'NOT_FOUND' });
    }
    const { id, isAdmin } = ctx.session.user;
    if (song.proposerId !== id && !isAdmin) {
      throw new TRPCError({ code: 'FORBIDDEN' });
    }

    // 2 人がほぼ同時に消しても後の方を失敗させないよう、件数で結果を見る deleteMany を使う
    await ctx.db.jamSessionSong.deleteMany({ where: { id: input.songId } });
  });
