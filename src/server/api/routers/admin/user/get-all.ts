import { adminProcedure } from '@/server/api/trpc';

/** メンバーやレク王を選ぶための、登録ユーザーの一覧 */
export const getAll = adminProcedure.query(({ ctx }) => {
  return ctx.db.user.findMany({
    select: { id: true, name: true, image: true },
    orderBy: { name: 'asc' },
  });
});
