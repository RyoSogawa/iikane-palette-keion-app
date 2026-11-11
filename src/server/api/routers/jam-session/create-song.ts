import { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';

import { SpotifyApiService } from '@/server/applications/services/spotify-api.service';

import { activeParticipantProcedure } from './procedures';
import { createSongInputSchema } from './schemas';

// SpotifyApiService は失敗しても例外を投げず void を返すので、ここで曲が取れたかを見る
const fetchTrack = async (spotifyId: string) => {
  const response = await new SpotifyApiService().getSeveralTracks([spotifyId]);
  const track = response?.tracks?.[0];
  if (track?.id !== spotifyId) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Spotify から曲を取得できませんでした' });
  }
  return {
    spotifyId: track.id,
    name: track.name,
    artist: track.artists.map(({ name }) => name).join(', '),
  };
};

/** 曲を挙げる。曲と自分の挙手を 1 回の作成で入れるので、どちらかだけが残ることは無い */
export const createSong = activeParticipantProcedure
  .input(createSongInputSchema)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;
    const song = input.spotifyId
      ? await fetchTrack(input.spotifyId)
      : { spotifyId: null, name: input.name, artist: input.artist };

    try {
      return await ctx.db.jamSessionSong.create({
        data: {
          proposerId: userId,
          ...song,
          entries: {
            create: input.parts.map((part) => ({
              userId,
              part,
              partNote: part === 'other' ? input.partNote : null,
            })),
          },
        },
        select: { id: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new TRPCError({ code: 'CONFLICT', message: 'この曲はすでに挙がっています' });
      }
      throw error;
    }
  });
