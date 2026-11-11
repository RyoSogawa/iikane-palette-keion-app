import { protectedProcedure } from '@/server/api/trpc';

import { isActiveParticipant } from './active-participant';
import { findMyParticipation } from './procedures';
import { joinInputSchema } from './schemas';

/** できるパートとルーツを保存して参加する。参加中に呼べば、参加した時刻はそのままでプロフィールだけ直す */
export const join = protectedProcedure.input(joinInputSchema).mutation(async ({ ctx, input }) => {
  const userId = ctx.session.user.id;
  const now = new Date();
  const current = await findMyParticipation(ctx.db, userId);
  const joinedAt =
    current?.joinedAt && isActiveParticipant(current.joinedAt, now) ? current.joinedAt : now;
  const data = { parts: input.parts, partNote: input.partNote, roots: input.roots, joinedAt };

  await ctx.db.jamSessionParticipant.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });
});
