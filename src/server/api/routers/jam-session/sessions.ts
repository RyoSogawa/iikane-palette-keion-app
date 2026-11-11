import { TRPCError } from '@trpc/server';

import { protectedProcedure } from '@/server/api/trpc';

import { canManageSession, findSessionOrThrow } from './procedures';
import { sessionIdInputSchema, sessionInputSchema, updateSessionInputSchema } from './schemas';

/** セッションの一覧。今日のセッションを先頭に出す並べ替えは、JST の今日を知る画面側で行う */
export const list = protectedProcedure.query(({ ctx }) =>
  ctx.db.jamSession.findMany({
    select: {
      id: true,
      name: true,
      heldOn: true,
      creatorId: true,
      _count: { select: { songs: true } },
    },
    orderBy: [{ heldOn: 'desc' }, { createdAt: 'desc' }],
  }),
);

/** ログインしていれば誰でもセッションを作れる */
export const create = protectedProcedure.input(sessionInputSchema).mutation(({ ctx, input }) =>
  ctx.db.jamSession.create({
    data: { name: input.name, heldOn: input.heldOn, creatorId: ctx.session.user.id },
    select: { id: true },
  }),
);

const assertCanManage = async (
  ctx: Parameters<Parameters<typeof protectedProcedure.query>[0]>[0]['ctx'],
  sessionId: string,
) => {
  const session = await findSessionOrThrow(ctx.db, sessionId);
  if (!canManageSession(session, ctx.session.user)) {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
};

/** 名前と日付の変更は、作った人と管理者だけ */
export const update = protectedProcedure
  .input(updateSessionInputSchema)
  .mutation(async ({ ctx, input }) => {
    await assertCanManage(ctx, input.sessionId);
    await ctx.db.jamSession.update({
      where: { id: input.sessionId },
      data: { name: input.session.name, heldOn: input.session.heldOn },
    });
  });

/** 削除は作った人と管理者だけ。曲と参加はまとめて消える */
export const deleteSession = protectedProcedure
  .input(sessionIdInputSchema)
  .mutation(async ({ ctx, input }) => {
    await assertCanManage(ctx, input.sessionId);
    await ctx.db.jamSession.delete({ where: { id: input.sessionId } });
  });
