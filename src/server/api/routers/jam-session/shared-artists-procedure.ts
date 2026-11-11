import { protectedProcedure } from '@/server/api/trpc';

import { activeSince } from './active-participant';
import { findSharedArtists } from './shared-artists';

/**
 * 参加中のメンバーの My Best Songs で重なっているアーティスト。やる曲を決める手がかりとして出す。
 * 全員の My Best Songs を読むので、5 秒おきに取る board には含めず別に取る。
 */
export const sharedArtists = protectedProcedure.query(async ({ ctx }) => {
  const participants = await ctx.db.jamSessionParticipant.findMany({
    where: { joinedAt: { gt: activeSince(new Date()) } },
    select: { userId: true },
  });
  if (participants.length < 2) return [];

  const songs = await ctx.db.myBestSong.findMany({
    where: { userId: { in: participants.map(({ userId }) => userId) } },
    select: { userId: true, artist: true },
  });
  return findSharedArtists(songs);
});
