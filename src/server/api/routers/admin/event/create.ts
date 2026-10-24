import { eventInputSchema } from '@/server/api/routers/admin/schemas';
import { adminProcedure } from '@/server/api/trpc';

/** 管理画面から作るイベントは、準備が終わるまで公開しないよう下書きで作る */
export const create = adminProcedure.input(eventInputSchema).mutation(({ ctx, input }) => {
  return ctx.db.event.create({
    data: { ...input, isDraft: true },
    select: { id: true },
  });
});
