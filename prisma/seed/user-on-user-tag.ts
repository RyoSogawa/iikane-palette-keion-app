import { PrismaClient, type User, type UserTag } from '@prisma/client';

import { type UserOnUserTag } from '@/types/generated/zod';

export default async function seedUserOnUserTag(users: User[], userTags: UserTag[]) {
  const prisma = new PrismaClient();
  const data: UserOnUserTag[] = users
    .map((user) => {
      const tagCount = Math.floor(Math.random() * 5);
      const tags = userTags.sort(() => Math.random() - 0.5).slice(0, tagCount);
      return tags.map((tag) => ({
        userId: user.id,
        userTagId: tag.id,
      }));
    })
    .flat();
  await prisma.userOnUserTag.createMany({
    data,
  });

  return data;
}
