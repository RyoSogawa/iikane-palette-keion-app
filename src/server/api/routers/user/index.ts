import { findById } from '@/server/api/routers/user/find-by-id';
import { createTRPCRouter } from '@/server/api/trpc';

import { getAll } from './get-all';

export const userRouter = createTRPCRouter({
  getAll,
  findById,
});
