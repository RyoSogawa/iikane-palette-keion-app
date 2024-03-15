import { findById } from '@/server/api/routers/user/find-by-id';
import { updateProfile } from '@/server/api/routers/user/update';
import { updateAvatar } from '@/server/api/routers/user/update-avatar';
import { createTRPCRouter } from '@/server/api/trpc';

import { getAll } from './get-all';

export const userRouter = createTRPCRouter({
  getAll,
  findById,
  updateProfile,
  updateAvatar,
});
