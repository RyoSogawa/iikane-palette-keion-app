import { create } from '@/server/api/routers/admin/band/create';
import { remove } from '@/server/api/routers/admin/band/remove';
import { reorder } from '@/server/api/routers/admin/band/reorder';
import { setMembers } from '@/server/api/routers/admin/band/set-members';
import { update } from '@/server/api/routers/admin/band/update';
import { createTRPCRouter } from '@/server/api/trpc';

export const adminBandRouter = createTRPCRouter({
  create,
  update,
  remove,
  reorder,
  setMembers,
});
