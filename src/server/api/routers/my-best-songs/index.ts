import { create } from '@/server/api/routers/my-best-songs/create';
import { deleteSong } from '@/server/api/routers/my-best-songs/delete';
import { findByUserId } from '@/server/api/routers/my-best-songs/find-by-user-id';
import { search } from '@/server/api/routers/my-best-songs/search';
import { createTRPCRouter } from '@/server/api/trpc';

export const myBestSongsRouter = createTRPCRouter({
  search,
  findByUserId,
  create,
  delete: deleteSong,
});
