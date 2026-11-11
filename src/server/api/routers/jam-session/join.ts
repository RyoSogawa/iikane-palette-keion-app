import { protectedProcedure } from '@/server/api/trpc';

import { isActiveParticipant } from './active-participant';
import { findParticipation, findSessionOrThrow } from './procedures';
import { joinSessionInputSchema } from './schemas';

/**
 * できるパートとルーツを保存して、セッションに参加する。プロフィールは人ごとに 1 つで、どのセッションでも使う。
 * 参加中に呼べば、参加した時刻はそのままでプロフィールだけ直す。
 */
export const join = protectedProcedure
  .input(joinSessionInputSchema)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;
    const { sessionId, profile } = input;
    await findSessionOrThrow(ctx.db, sessionId);

    const now = new Date();
    const current = await findParticipation(ctx.db, sessionId, userId);
    const joinedAt =
      current?.joinedAt && isActiveParticipant(current.joinedAt, now) ? current.joinedAt : now;
    const profileData = { parts: profile.parts, partNote: profile.partNote, roots: profile.roots };

    await ctx.db.$transaction([
      ctx.db.jamSessionProfile.upsert({
        where: { userId },
        create: { userId, ...profileData },
        update: profileData,
      }),
      ctx.db.jamSessionParticipant.upsert({
        where: { sessionId_userId: { sessionId, userId } },
        create: { sessionId, userId, joinedAt },
        update: { joinedAt },
      }),
    ]);
  });
