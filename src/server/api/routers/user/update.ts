import { type z } from 'zod';

import { protectedProcedure } from '@/server/api/trpc';
import { UserSchema } from '@/types/generated/zod';

const userUpdateProfileInputSchema = UserSchema.pick({
  id: true,
  name: true,
  nickname: true,
  residence: true,
  introduction: true,
  instagramLink: true,
  twitterLink: true,
  musicLink: true,
  podcastLink: true,
  websiteLink: true,
});

export type UserUpdateProfileInput = z.infer<typeof userUpdateProfileInputSchema>;

export const updateProfile = protectedProcedure
  .input(userUpdateProfileInputSchema)
  .mutation(({ ctx, input }) => {
    if (ctx.session.user.id !== input.id) {
      throw new Error('Invalid user id');
    }

    return ctx.db.user.update({
      where: {
        id: ctx.session.user.id,
      },
      data: {
        name: input.name,
        nickname: input.nickname,
        residence: input.residence,
        introduction: input.introduction,
        instagramLink: input.instagramLink,
        twitterLink: input.twitterLink,
        musicLink: input.musicLink,
        podcastLink: input.podcastLink,
        websiteLink: input.websiteLink,
      },
    });
  });
