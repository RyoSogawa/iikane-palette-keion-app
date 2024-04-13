import { z } from 'zod';

import { publicProcedure } from '@/server/api/trpc';

const inputSchema = z.object({
  userId: z.string(),
});

export const findByUserId = publicProcedure.input(inputSchema).query(async ({ ctx, input }) => {
  return ctx.db.myBestSong.findMany({
    where: {
      userId: input.userId,
    },
  });
});
