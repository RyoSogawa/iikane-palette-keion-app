import { z } from 'zod';

import { protectedProcedure } from '@/server/api/trpc';

const inputSchema = z.object({
  id: z.string(),
});

export const deleteSong = protectedProcedure.input(inputSchema).mutation(async ({ input, ctx }) => {
  const data = await ctx.db.myBestSong.findFirst({
    select: {
      userId: true,
    },
    where: {
      id: input.id,
    },
  });

  if (!data) {
    throw new Error('Not found');
  }

  if (data.userId !== ctx.session?.user.id) {
    throw new Error('Forbidden');
  }

  return ctx.db.myBestSong.delete({
    where: {
      id: input.id,
    },
  });
});
