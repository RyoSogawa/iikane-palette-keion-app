import { protectedProcedure } from '@/server/api/trpc';

import { assertActiveParticipant, findSongOrThrow } from './procedures';
import { setMyPartsInputSchema } from './schemas';

/** ある曲の自分のパート一式を置き換える。空なら取り下げ。ほかの人の挙手には触らない */
export const setMyParts = protectedProcedure
  .input(setMyPartsInputSchema)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;
    const song = await findSongOrThrow(ctx.db, input.songId);
    await assertActiveParticipant(ctx.db, song.sessionId, userId);

    await ctx.db.$transaction([
      ctx.db.jamSessionEntry.deleteMany({ where: { songId: input.songId, userId } }),
      ctx.db.jamSessionEntry.createMany({
        data: input.parts.map((part) => ({
          songId: input.songId,
          userId,
          part,
          partNote: part === 'other' ? input.partNote : null,
        })),
        // 同じ人が 2 台から同時に保存しても、一意制約で失敗させない
        skipDuplicates: true,
      }),
    ]);
  });
