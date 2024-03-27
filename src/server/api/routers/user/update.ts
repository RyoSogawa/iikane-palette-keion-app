import { z } from 'zod';

import { protectedProcedure } from '@/server/api/trpc';
import { UserSchema } from '@/types/generated/zod';

const userUpdateProfileInputSchema = z.intersection(
  UserSchema.pick({
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
  }),
  z.object({
    tags: z.array(z.string()),
  }),
);

export const updateProfile = protectedProcedure
  .input(userUpdateProfileInputSchema)
  .mutation(({ ctx, input }) => {
    if (ctx.session.user.id !== input.id) {
      throw new Error('Invalid user id');
    }

    return ctx.db.$transaction(async (tx) => {
      await tx.userTag.createMany({
        data: input.tags.map((tag) => ({
          name: tag,
        })),
        skipDuplicates: true,
      });

      const userTags = await tx.userTag.findMany({
        where: {
          name: {
            in: input.tags,
          },
        },
      });

      await Promise.all([
        tx.user.update({
          where: {
            id: input.id,
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
        }),
        tx.userOnUserTag.deleteMany({
          where: {
            AND: {
              NOT: {
                userTagId: {
                  in: userTags.map((tag) => tag.id),
                },
              },
              userId: input.id,
            },
          },
        }),
        tx.userOnUserTag.createMany({
          data: userTags.map((tag) => ({
            userTagId: tag.id,
            userId: input.id,
          })),
          skipDuplicates: true,
        }),
      ]);
    });
  });
