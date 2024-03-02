import { type z } from 'zod';

import { protectedProcedure } from '@/server/api/trpc';
import { UserSchema } from '@/types/generated/zod';

const userUpdateProfileInputSchema = UserSchema.pick({
  id: true,
  name: true,
  nickname: true,
  introduction: true,
});

export type UserUpdateProfileInput = z.infer<typeof userUpdateProfileInputSchema>;

export const updateProfile = protectedProcedure
  .input(userUpdateProfileInputSchema)
  .mutation(({ ctx, input }) => {
    if (ctx.session.user.id !== input.id) {
      throw new Error('Invalid user id');
    }

    return ctx.db.user.upsert({
      where: {
        id: ctx.session.user.id,
      },
      create: {
        name: input.name,
        nickname: input.nickname,
        introduction: input.introduction,
      },
      update: {
        name: input.name,
        nickname: input.nickname,
        introduction: input.introduction,
      },
    });
  });
