import { protectedProcedure } from '@/server/api/trpc';

import { activeSince, isActiveParticipant } from './active-participant';
import { findMyParticipation } from './procedures';

/**
 * ページに出すものを 1 回で返す。5 秒おきに取り直すので、クエリは参加者と曲の 2 本に抑える。
 * 退出した人の挙手は消さずに残し、ここで参加中の人の挙手だけに絞って返す。
 */
export const board = protectedProcedure.query(async ({ ctx }) => {
  const now = new Date();
  const activeWhere = { joinedAt: { gt: activeSince(now) } };
  const userId = ctx.session.user.id;

  const [participants, songs, me] = await Promise.all([
    ctx.db.jamSessionParticipant.findMany({
      where: activeWhere,
      select: {
        userId: true,
        parts: true,
        partNote: true,
        roots: true,
        joinedAt: true,
        user: { select: { id: true, name: true, image: true } },
      },
      orderBy: { joinedAt: 'asc' },
    }),
    ctx.db.jamSessionSong.findMany({
      select: {
        id: true,
        createdAt: true,
        proposerId: true,
        spotifyId: true,
        name: true,
        artist: true,
        playedAt: true,
        entries: {
          where: { user: { jamSessionProfile: { is: activeWhere } } },
          select: { userId: true, part: true, partNote: true },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    findMyParticipation(ctx.db, userId),
  ]);

  return {
    participants,
    songs,
    viewer: {
      userId,
      isAdmin: ctx.session.user.isAdmin,
      isActive: isActiveParticipant(me?.joinedAt, now),
      profile: me ? { parts: me.parts, partNote: me.partNote, roots: me.roots } : null,
    },
  };
});
