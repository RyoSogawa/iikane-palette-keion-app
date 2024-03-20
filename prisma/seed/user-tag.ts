import { PrismaClient } from '@prisma/client';

import { type UserTag } from '@/types/generated/zod';

export default async function seedUserTag() {
  const prisma = new PrismaClient();
  const data: UserTag[] = Array(25)
    .fill(0)
    .map((_, i) => ({
      id: i.toString(),
      name: `タグ${i}`,
      createdAt: new Date(),
    }));
  await prisma.userTag.createMany({
    data,
  });

  return data;
}
