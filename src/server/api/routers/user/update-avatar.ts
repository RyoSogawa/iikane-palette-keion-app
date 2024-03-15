import { z } from 'zod';

import { protectedProcedure } from '@/server/api/trpc';

const userUpdateAvatarInputSchema = z.object({
  id: z.string(),
  image: z.string(),
  file: z.custom<File>(),
});

export type UserUpdateAvatarInput = z.infer<typeof userUpdateAvatarInputSchema>;

export const updateAvatar = protectedProcedure
  .input(userUpdateAvatarInputSchema)
  .mutation(({ ctx, input }) => {
    if (ctx.session.user.id !== input.id) {
      throw new Error('Invalid user id');
    }

    return ctx.db.user.update({
      where: { id: input.id },
      data: {
        image: input.image,
      },
    });
  });
