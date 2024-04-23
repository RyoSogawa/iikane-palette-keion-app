import { z } from 'zod';

import { publicProcedure } from '@/server/api/trpc';
import { FetchSongImageService } from '@/server/applications/services/fetch-song-image.service';
import { SongWithImageSchema } from '@/types/types';

const inputSchema = z.object({
  userId: z.string(),
});

const OutputSchema = z.array(SongWithImageSchema);

export const findByUserId = publicProcedure
  .input(inputSchema)
  .query<z.infer<typeof OutputSchema>>(async ({ ctx, input }) => {
    const songs = await ctx.db.myBestSong.findMany({
      where: {
        userId: input.userId,
      },
      orderBy: {
        order: 'asc',
      },
    });

    const fetchSongImageService = new FetchSongImageService();
    return fetchSongImageService.invoke(songs);
  });
