import { protectedProcedure } from '@/server/api/trpc';

import { toEntryRows } from './entry-rows';
import { assertActiveParticipant, findSongOrThrow } from './guards';
import { setMyPartsInputSchema } from './schemas';

/** ある曲の自分のパート一式を置き換える。空なら取り下げ。ほかの人の挙手には触らない */
export const setMyParts = protectedProcedure
  .input(setMyPartsInputSchema)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;
    const song = await findSongOrThrow(ctx.db, input.songId);
    await assertActiveParticipant(ctx.db, song.sessionId, userId);

    // 同じ人が 2 台から同時に保存したとき、パートが足し合わされず後の保存がそのまま残るよう、
    // 曲の行をロックして同じ曲への保存を 1 本ずつ流す
    await ctx.db.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT 1 FROM "JamSessionSong" WHERE id = ${input.songId} FOR UPDATE`;
      await tx.jamSessionEntry.deleteMany({ where: { songId: input.songId, userId } });
      await tx.jamSessionEntry.createMany({
        data: toEntryRows(userId, input.parts, input.partNote).map((row) => ({
          ...row,
          songId: input.songId,
        })),
      });
    });
  });
