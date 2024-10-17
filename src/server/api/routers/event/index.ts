import { findById } from '@/server/api/routers/event/find-by-id';
import { getAll } from '@/server/api/routers/event/get-all';
import { createTRPCRouter } from '@/server/api/trpc';

export const eventRouter = createTRPCRouter({
  getAll,
  findById,
});
