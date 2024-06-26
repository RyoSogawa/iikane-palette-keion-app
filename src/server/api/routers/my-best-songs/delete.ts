import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { protectedProcedure } from '@/server/api/trpc';

const inputSchema = z.object({
  id: z.string(),
});

export const deleteSong = protectedProcedure.input(inputSchema).mutation(async ({ input, ctx }) => {
  const data = await ctx.db.myBestSong.findFirst({
    select: {
      userId: true,
      order: true,
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

  revalidatePath(`/members/${data.userId}/my-best-songs`);

  return ctx.db.$transaction(async (tx) => {
    await Promise.all([
      tx.myBestSong.delete({
        where: {
          id: input.id,
        },
      }),
      tx.myBestSong.updateMany({
        where: {
          userId: data.userId,
          order: {
            gt: data.order,
          },
        },
        data: {
          order: {
            decrement: 1,
          },
        },
      }),
    ]);
  });
});
