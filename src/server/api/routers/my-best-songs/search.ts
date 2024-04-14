import { z } from 'zod';

import { protectedProcedure } from '@/server/api/trpc';
import { SongTypeSchema } from '@/types/generated/zod';
import { SpotifyApi } from '@/utils/spotify';

const inputSchema = z.object({
  keyword: z.string(),
  type: SongTypeSchema,
});

const songSchema = z.object({
  type: SongTypeSchema,
  spotifyId: z.string(),
  artist: z.string(),
  name: z.string(),
  image: z.string(),
  uri: z.string(),
});

export const search = protectedProcedure
  .input(inputSchema)
  .query<Array<z.infer<typeof songSchema>>>(async ({ input }) => {
    const spotifyApi = new SpotifyApi();
    const res = await spotifyApi.search({
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
          uri: track.uri,
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
        uri: album.uri,
      })) ?? []
    );
  });
