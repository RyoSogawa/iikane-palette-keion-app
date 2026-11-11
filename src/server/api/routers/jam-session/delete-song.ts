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

    await ctx.db.jamSessionSong.delete({ where: { id: input.songId } });
  });
