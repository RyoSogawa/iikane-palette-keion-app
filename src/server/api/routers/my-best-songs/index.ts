import { search } from '@/server/api/routers/my-best-songs/search';
import { createTRPCRouter } from '@/server/api/trpc';

export const myBestSongsRouter = createTRPCRouter({
  search,
});
