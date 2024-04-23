import { z } from 'zod';

import { protectedProcedure } from '@/server/api/trpc';
import { SpotifyApiService } from '@/server/applications/services/spotify-api.service';
import { MyBestSongSchema, SongTypeSchema } from '@/types/generated/zod';

const inputSchema = z.object({
  keyword: z.string(),
  type: SongTypeSchema,
});

const songSchema = MyBestSongSchema.pick({
  type: true,
  spotifyId: true,
  artist: true,
  name: true,
  image: true,
});

export const search = protectedProcedure
  .input(inputSchema)
  .query<Array<z.infer<typeof songSchema>>>(async ({ input }) => {
    const spotifyApiService = new SpotifyApiService();
    const res = await spotifyApiService.search({
      q: input.keyword,
      market: 'JP',
      type: input.type,
      limit: 20,
    });
    if (!res) {
      return [];
    }

    if (input.type === 'track') {
      return (
        res.tracks?.items.map((track) => ({
          type: 'track',
          spotifyId: track.id,
          artist: track.artists.map((artist) => artist.name).join(', '),
          name: track.name,
          image: track.album.images[0]?.url ?? '',
        })) ?? []
      );
    }

    return (
      res.albums?.items.map((album) => ({
        type: 'album',
        spotifyId: album.id,
        artist: album.artists.map((artist) => artist.name).join(', '),
        name: album.name,
        image: album.images[0]?.url ?? '',
      })) ?? []
    );
  });
