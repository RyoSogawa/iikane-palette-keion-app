import { protectedProcedure } from '@/server/api/trpc';

import { activeSince, isActiveParticipant } from './active-participant';
import { canManageSession, findParticipation, findSessionOrThrow } from './procedures';
import { sessionIdInputSchema } from './schemas';

/**
 * セッションのページに出すものを 1 回で返す。5 秒おきに取り直すので、クエリの数を抑える。
 * 退出した人の挙手は消さずに残し、ここで参加中の人の挙手だけに絞って返す。
 */
export const board = protectedProcedure
  .input(sessionIdInputSchema)
  .query(async ({ ctx, input }) => {
    const now = new Date();
    const { sessionId } = input;
    const active = { sessionId, joinedAt: { gt: activeSince(now) } };
    const user = ctx.session.user;

    const session = await findSessionOrThrow(ctx.db, sessionId);
    const [participants, songs, me, profile] = await Promise.all([
      ctx.db.jamSessionParticipant.findMany({
        where: active,
        select: {
          userId: true,
          joinedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              jamSessionProfile: { select: { parts: true, partNote: true, roots: true } },
            },
          },
        },
        orderBy: { joinedAt: 'asc' },
      }),
      ctx.db.jamSessionSong.findMany({
        where: { sessionId },
        select: {
          id: true,
          createdAt: true,
          proposerId: true,
          spotifyId: true,
          name: true,
          artist: true,
          playedAt: true,
          entries: {
            where: { user: { jamSessionJoins: { some: active } } },
            select: { userId: true, part: true, partNote: true },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      findParticipation(ctx.db, sessionId, user.id),
      ctx.db.jamSessionProfile.findUnique({
        where: { userId: user.id },
        select: { parts: true, partNote: true, roots: true },
      }),
    ]);

    return {
      session,
      participants: participants.map(
        ({ userId, joinedAt, user: { jamSessionProfile, ...rest } }) => ({
          userId,
          joinedAt,
          parts: jamSessionProfile?.parts ?? [],
          partNote: jamSessionProfile?.partNote ?? null,
          roots: jamSessionProfile?.roots ?? [],
          user: rest,
        }),
      ),
      songs,
      viewer: {
        userId: user.id,
        isAdmin: user.isAdmin,
        isActive: isActiveParticipant(me?.joinedAt, now),
        canManageSession: canManageSession(session, user),
        profile,
      },
    };
  });
