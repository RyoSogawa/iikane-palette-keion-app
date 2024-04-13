import { add } from '@/server/api/routers/my-best-songs/add';
import { deleteSong } from '@/server/api/routers/my-best-songs/delete';
import { findByUserId } from '@/server/api/routers/my-best-songs/find-by-user-id';
import { search } from '@/server/api/routers/my-best-songs/search';
import { createTRPCRouter } from '@/server/api/trpc';

export const myBestSongsRouter = createTRPCRouter({
  search,
  findByUserId,
  add,
  delete: deleteSong,
});
