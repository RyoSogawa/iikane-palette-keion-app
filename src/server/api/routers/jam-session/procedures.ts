import { TRPCError } from '@trpc/server';

import { protectedProcedure } from '@/server/api/trpc';

import { isActiveParticipant } from './active-participant';

import type { PrismaClient } from '@prisma/client';

type Db = Pick<PrismaClient, 'jamSessionParticipant'>;

export const findMyParticipation = (db: Db, userId: string) =>
  db.jamSessionParticipant.findUnique({
    where: { userId },
    select: { joinedAt: true, parts: true, partNote: true, roots: true },
  });

export const assertActiveParticipant = async (db: Db, userId: string) => {
  const participant = await findMyParticipation(db, userId);
  if (!isActiveParticipant(participant?.joinedAt, new Date())) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'セッションに参加してから操作してください' });
  }
};

/**
 * 参加中のメンバーだけが呼べる procedure。曲を挙げる・手を挙げる・演奏済みにする操作はこれで作る。
 * 入力の検証より前に判定するので、未参加なら入力に関係なく FORBIDDEN になる。
 */
export const activeParticipantProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  await assertActiveParticipant(ctx.db, ctx.session.user.id);
  return next();
});
