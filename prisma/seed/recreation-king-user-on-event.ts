import { PrismaClient, type User } from '@prisma/client';

import { type RecreationKingUserOnEvent } from '@/types/generated/zod';

export default async function seedRecreationKingUserOnEvent(users: User[]) {
  const prisma = new PrismaClient();
  // usersから5名をランダムに選んで特定のeventIdに紐づける
  const data: RecreationKingUserOnEvent[] = users
    .sort(() => Math.random() - 0.5)
    .slice(0, 5)
    .map((user) => ({
      userId: user.id,
      eventId: '202410-keion-gasshuku-4',
    }));

  await prisma.recreationKingUserOnEvent.createMany({
    data,
  });

  return data;
}
