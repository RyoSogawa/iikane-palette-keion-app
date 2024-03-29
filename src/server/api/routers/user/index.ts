import { deleteMe } from '@/server/api/routers/user/delete-me';
import { findById } from '@/server/api/routers/user/find-by-id';
import { update } from '@/server/api/routers/user/update';
import { createTRPCRouter } from '@/server/api/trpc';

import { getAll } from './get-all';

export const userRouter = createTRPCRouter({
  getAll,
  findById,
  update,
  deleteMe,
});
