import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { protectedProcedure } from '@/server/api/trpc';
import { UserSchema } from '@/types/generated/zod';

const userUpdateProfileInputSchema = z.intersection(
  z.object({
    id: z.string(),
    tags: z.array(z.string()).optional(),
  }),
  UserSchema.pick({
    name: true,
    nickname: true,
    image: true,
    residence: true,
    introduction: true,
    instagramUsername: true,
    twitterUsername: true,
    musicLink: true,
    podcastLink: true,
    websiteLink: true,
  }).partial(),
);

export const update = protectedProcedure
  .input(userUpdateProfileInputSchema)
  .mutation(({ ctx, input }) => {
    if (ctx.session.user.id !== input.id) {
      throw new Error('Invalid user id');
    }

    return ctx.db.$transaction(async (tx) => {
      async function upsertUserTag(tags: string[]) {
        await tx.userTag.createMany({
          data: tags.map((tag) => ({
            name: tag,
          })),
          skipDuplicates: true,
        });

        const userTags = await tx.userTag.findMany({
          where: {
            name: {
              in: tags,
            },
          },
        });

        await Promise.all([
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
      }

      await Promise.all([
        tx.user.update({
          where: {
            id: input.id,
          },
          data: {
            name: input.name,
            image: input.image,
            nickname: input.nickname,
            residence: input.residence,
            introduction: input.introduction,
            instagramUsername: input.instagramUsername,
            twitterUsername: input.twitterUsername,
            musicLink: input.musicLink,
            podcastLink: input.podcastLink,
            websiteLink: input.websiteLink,
          },
        }),
        input.tags ? upsertUserTag(input.tags) : undefined,
      ]);

      revalidatePath(`/members/${input.id}`);
      revalidatePath(`/`);
    });
  });
