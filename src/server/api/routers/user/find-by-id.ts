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
      websiteLink: true,
      musicLink: true,
      podcastLink: true,
      instagramUsername: true,
      twitterUsername: true,
      tags: {
        select: {
          userTag: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      recreationKingEvents: {
        select: {
          event: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
});
