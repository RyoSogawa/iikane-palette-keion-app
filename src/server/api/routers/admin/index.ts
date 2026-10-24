import { adminBandRouter } from '@/server/api/routers/admin/band';
import { adminEventRouter } from '@/server/api/routers/admin/event';
import { set as setImage } from '@/server/api/routers/admin/image/set';
import { getAll as getAllUsers } from '@/server/api/routers/admin/user/get-all';
import { createTRPCRouter } from '@/server/api/trpc';

/** 管理画面用の API。すべて adminProcedure で作り、管理者以外は呼べない */
export const adminRouter = createTRPCRouter({
  event: adminEventRouter,
  band: adminBandRouter,
  image: createTRPCRouter({ set: setImage }),
  user: createTRPCRouter({ getAll: getAllUsers }),
});
