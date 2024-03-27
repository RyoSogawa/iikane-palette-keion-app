import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { protectedProcedure } from '@/server/api/trpc';

const userUpdateAvatarInputSchema = z.object({
  id: z.string(),
  image: z.string(),
});

export const updateAvatar = protectedProcedure
  .input(userUpdateAvatarInputSchema)
  .mutation(async ({ ctx, input }) => {
    if (ctx.session.user.id !== input.id) {
      throw new Error('Invalid user id');
    }

    await ctx.db.user.update({
      where: { id: input.id },
      data: {
        image: input.image,
      },
    });

    revalidatePath(`/members/${input.id}`);
    revalidatePath(`/`);
  });
