import { revalidatePath } from 'next/cache';

import { protectedProcedure } from '@/server/api/trpc';
import { MyBestSongSchema } from '@/types/generated/zod';

const inputSchema = MyBestSongSchema.pick({
  userId: true,
  spotifyId: true,
  name: true,
  artist: true,
  type: true,
});

export const create = protectedProcedure.input(inputSchema).mutation(async ({ input, ctx }) => {
  revalidatePath(`/members/${input.userId}/my-best-songs`);

  const max = await ctx.db.myBestSong.aggregate({
    where: {
      userId: input.userId,
    },
    _max: {
      order: true,
    },
  });

  const order = max._max.order == null ? 0 : max._max.order + 1;

  return ctx.db.myBestSong.create({
    data: {
      userId: input.userId,
      spotifyId: input.spotifyId,
      name: input.name,
      artist: input.artist,
      type: input.type,
      order,
    },
  });
});
