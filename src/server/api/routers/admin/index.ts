import { adminBandRouter } from '@/server/api/routers/admin/band';
import { adminEventRouter } from '@/server/api/routers/admin/event';
import { list as listUsers } from '@/server/api/routers/admin/user/list';
import { createTRPCRouter } from '@/server/api/trpc';

/** 管理画面用の API。すべて adminProcedure で作り、管理者以外は呼べない */
export const adminRouter = createTRPCRouter({
  event: adminEventRouter,
  band: adminBandRouter,
  user: createTRPCRouter({ list: listUsers }),
});
