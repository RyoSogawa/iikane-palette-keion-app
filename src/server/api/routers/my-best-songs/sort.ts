import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { protectedProcedure } from '@/server/api/trpc';

const inputSchema = z.object({
  id: z.string(),
  newOrder: z.number(),
});

export const sort = protectedProcedure.input(inputSchema).mutation(async ({ input, ctx }) => {
  const data = await ctx.db.myBestSong.findUnique({
    where: {
      id: input.id,
    },
  });

  if (!data) {
    throw new Error('Not found');
  }

  if (data.userId !== ctx.session.user.id) {
    throw new Error('Unauthorized');
  }

  const oldOrder = data.order;

  if (oldOrder === input.newOrder) {
    return data;
  }

  const isIncrement = oldOrder < input.newOrder;

  return ctx.db.$transaction(async (tx) => {
    await tx.myBestSong.updateMany({
      where: {
        userId: data.userId,
        order: {
          gte: Math.min(oldOrder, input.newOrder),
          lte: Math.max(oldOrder, input.newOrder),
        },
      },
      data: {
        order: {
          [isIncrement ? 'decrement' : 'increment']: 1,
        },
      },
    });

    const newData = await tx.myBestSong.update({
      where: {
        id: input.id,
      },
      data: {
        order: input.newOrder,
      },
    });

    revalidatePath(`/members/${data.userId}/my-best-songs`);

    return newData;
  });
});
