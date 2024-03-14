import { createTRPCRouter } from '@/server/api/trpc';

import { getAll } from './get-all';

export const userTagRouter = createTRPCRouter({
  getAll,
});
