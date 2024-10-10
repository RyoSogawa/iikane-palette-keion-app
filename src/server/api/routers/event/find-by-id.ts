import { z } from 'zod';

import { publicProcedure } from '@/server/api/trpc';

const inputSchema = z.object({ id: z.string() });

export const findById = publicProcedure.input(inputSchema).query(({ ctx, input }) => {
  return ctx.db.event.findUnique({
    where: {
      id: input.id,
    },
    select: {
      id: true,
      dateFrom: true,
      dateTo: true,
      name: true,
      description: true,
      image: true,
      movie: true,
      driveLink: true,
      RecreationKingUserOnEvent: {
        select: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      },
      Band: {
        select: {
          id: true,
          name: true,
          photo: true,
          image: true,
          typoImage: true,
          description: true,
          liveOrder: true,
          movie: true,
          UserOnBand: {
            select: {
              userName: true,
              order: true,
              part: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
            orderBy: {
              order: 'asc',
            },
          },
        },
        orderBy: {
          liveOrder: 'asc',
        },
      },
    },
  });
});
