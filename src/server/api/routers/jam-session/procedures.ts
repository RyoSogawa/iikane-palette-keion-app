import { TRPCError } from '@trpc/server';

import { isActiveParticipant } from './active-participant';

import type { PrismaClient } from '@prisma/client';

type Db = Pick<PrismaClient, 'jamSession' | 'jamSessionParticipant' | 'jamSessionSong'>;

export const findParticipation = (db: Db, sessionId: string, userId: string) =>
  db.jamSessionParticipant.findUnique({
    where: { sessionId_userId: { sessionId, userId } },
    select: { joinedAt: true },
  });

/** 曲を挙げる・手を挙げる・演奏済みにする操作は、そのセッションに参加中の人だけに許す */
export const assertActiveParticipant = async (db: Db, sessionId: string, userId: string) => {
  const participation = await findParticipation(db, sessionId, userId);
  if (!isActiveParticipant(participation?.joinedAt, new Date())) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'セッションに参加してから操作してください' });
  }
};

export const findSessionOrThrow = async (db: Db, sessionId: string) => {
  const session = await db.jamSession.findUnique({
    where: { id: sessionId },
    select: { id: true, name: true, heldOn: true, creatorId: true },
  });
  if (!session) {
    throw new TRPCError({ code: 'NOT_FOUND' });
  }
  return session;
};

/** 曲の操作は、その曲が属するセッションへの参加で判定するので、先に曲のセッションを引く */
export const findSongOrThrow = async (db: Db, songId: string) => {
  const song = await db.jamSessionSong.findUnique({
    where: { id: songId },
    select: { id: true, sessionId: true, proposerId: true },
  });
  if (!song) {
    throw new TRPCError({ code: 'NOT_FOUND' });
  }
  return song;
};

export const canManageSession = (
  session: { creatorId: string | null },
  user: { id: string; isAdmin: boolean },
) => session.creatorId === user.id || user.isAdmin;
