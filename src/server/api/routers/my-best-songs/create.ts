import { protectedProcedure } from '@/server/api/trpc';
import { MyBestSongSchema } from '@/types/generated/zod';

const inputSchema = MyBestSongSchema.pick({
  userId: true,
  spotifyId: true,
  name: true,
  artist: true,
  image: true,
  type: true,
});

export const create = protectedProcedure.input(inputSchema).mutation(async ({ input, ctx }) => {
  return ctx.db.myBestSong.create({
    data: {
      userId: input.userId,
      spotifyId: input.spotifyId,
      name: input.name,
      artist: input.artist,
      image: input.image,
      type: input.type,
    },
  });
});
