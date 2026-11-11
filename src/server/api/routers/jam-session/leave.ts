import { protectedProcedure } from '@/server/api/trpc';

import { assertActiveParticipant } from './procedures';
import { leaveInputSchema } from './schemas';

/**
 * 退出する。userId を指定すれば、退出を忘れて帰った人を退出させる（呼ぶ側が参加中のときだけ）。
 * 挙手は消さないので、退出させられた人が参加し直せば元に戻る。
 */
export const leave = protectedProcedure.input(leaveInputSchema).mutation(async ({ ctx, input }) => {
  const myId = ctx.session.user.id;
  const targetId = input?.userId ?? myId;
  if (targetId !== myId) {
    await assertActiveParticipant(ctx.db, myId);
  }

  await ctx.db.jamSessionParticipant.updateMany({
    where: { userId: targetId },
    data: { joinedAt: null },
  });
});
