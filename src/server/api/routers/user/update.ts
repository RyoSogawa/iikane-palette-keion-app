import { z } from 'zod';

import { protectedProcedure } from '@/server/api/trpc';
import { UserPartSchema, UserSchema } from '@/types/generated/zod';

const userUpdateProfileInputSchema = z.intersection(
  UserSchema.pick({
    id: true,
    name: true,
    nickname: true,
    residence: true,
    introduction: true,
    instagramUsername: true,
    twitterUsername: true,
    musicLink: true,
    podcastLink: true,
    website: true,
  }),
  z.object({
    UserParts: z.array(
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
      const user = await tx.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          name: input.name,
          nickname: input.nickname,
          residence: input.residence,
          introduction: input.introduction,
          instagramUsername: input.instagramUsername,
          twitterUsername: input.twitterUsername,
          musicLink: input.musicLink,
          podcastLink: input.podcastLink,
          website: input.website,
        },
      });

      await tx.userPart.deleteMany({
        where: {
          userId: user.id,
        },
      });

      await tx.userPart.createMany({
        data: input.UserParts.map((part) => ({
          ...part,
          userId: user.id,
        })),
      });
    });
  });
