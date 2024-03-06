import { z } from 'zod';

import { publicProcedure } from '@/server/api/trpc';

const inputSchema = z.object({ id: z.string() });

export const findById = publicProcedure.input(inputSchema).query(({ ctx, input }) => {
  return ctx.db.user.findUnique({
    where: {
      id: input.id,
    },
    select: {
      id: true,
      name: true,
      nickname: true,
      residence: true,
      introduction: true,
      image: true,
      website: true,
      musicLink: true,
      podcastLink: true,
      instagramUsername: true,
      twitterUsername: true,
      UserParts: {
        select: {
          id: true,
          partIcon: true,
          order: true,
          remark: true,
        },
      },
    },
  });
});
