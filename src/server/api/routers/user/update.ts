import { z } from 'zod';

import { protectedProcedure } from '@/server/api/trpc';
import { UserPartSchema, UserSchema } from '@/types/generated/zod';

const userUpdateProfileInputSchema = z.intersection(
  UserSchema.pick({
    id: true,
    name: true,
    nickname: true,
    introduction: true,
  }),
  z.object({
    UserPart: z.array(
      UserPartSchema.pick({
        partIcon: true,
        order: true,
        remark: true,
      }),
    ),
  }),
);

export type UserUpdateProfileInput = z.infer<typeof userUpdateProfileInputSchema>;

export const updateProfile = protectedProcedure
  .input(userUpdateProfileInputSchema)
  .mutation(({ ctx, input }) => {
    if (ctx.session.user.id !== input.id) {
      throw new Error('Invalid user id');
    }

    return ctx.db.$transaction(async (tx) => {
      const user = await tx.user.upsert({
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

      await tx.userPart.deleteMany({
        where: {
          userId: user.id,
        },
      });

      await tx.userPart.createMany({
        data: input.UserPart.map((part) => ({
          ...part,
          userId: user.id,
        })),
      });
    });
  });
