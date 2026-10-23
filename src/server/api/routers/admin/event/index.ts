import { create } from '@/server/api/routers/admin/event/create';
import { findById } from '@/server/api/routers/admin/event/find-by-id';
import { list } from '@/server/api/routers/admin/event/list';
import { remove } from '@/server/api/routers/admin/event/remove';
import { setDraft } from '@/server/api/routers/admin/event/set-draft';
import { setRecreationKings } from '@/server/api/routers/admin/event/set-recreation-kings';
import { update } from '@/server/api/routers/admin/event/update';
import { createTRPCRouter } from '@/server/api/trpc';

export const adminEventRouter = createTRPCRouter({
  list,
  findById,
  create,
  update,
  setDraft,
  remove,
  setRecreationKings,
});
