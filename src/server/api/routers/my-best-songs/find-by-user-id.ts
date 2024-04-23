import split from 'just-split';
import { z } from 'zod';

import { publicProcedure } from '@/server/api/trpc';
import { SpotifyApiService } from '@/server/applications/services/spotify-api.service';
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

    const albumIds = songs.filter((song) => song.type === 'album').map((song) => song.spotifyId);
    const albumIdsChunks = split(albumIds, 20); // albumsの取得は20件ずつに分割して取得しないといけないので
    const trackIds = songs.filter((song) => song.type === 'track').map((song) => song.spotifyId);

    const spotifyApiService = new SpotifyApiService();
    await spotifyApiService.setAccessToken();

    const [tracks, ...albums] = await Promise.all([
      spotifyApiService.getSeveralTracks(trackIds),
      ...albumIdsChunks.map((ids) => spotifyApiService.getSeveralAlbums(ids)),
    ]);

    const songsWithImage = songs.map((song) => {
      if (song.type === 'track') {
        if (!tracks) return song;
        const foundTrack = tracks.tracks.find((t) => t.id === song.spotifyId);
        return {
          ...song,
          image: foundTrack?.album.images[0]?.url,
        };
      }

      if (!albums) return song;
      // albumsのデータをまとめる
      const groupedAlbums = albums
        .map((album) => album?.albums)
        .filter(Boolean)
        .flat();
      const foundAlbum = groupedAlbums.find((album) => album?.id === song.spotifyId);
      return {
        ...song,
        image: foundAlbum?.images[0]?.url,
      };
    });

    return songsWithImage;
  });
