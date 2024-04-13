import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';

import { type MyBestSong, type User } from '@/types/generated/zod';

export default async function seedMyBestSong(users: User[]) {
  const prisma = new PrismaClient();
  const data: MyBestSong[] = users
    .map((user) => {
      const count = Math.floor(Math.random() * 50);
      enum Type {
        track = 'track',
        album = 'album',
      }
      return Array.from({ length: count }).map(() => ({
        id: faker.string.uuid(),
        createdAt: new Date(),
        userId: user.id,
        type: faker.helpers.enumValue(Type),
        spotifyId: '12345',
        name: faker.music.songName(),
        artist: faker.person.fullName(),
        image: faker.image.url(),
      }));
    })
    .flat();

  await prisma.myBestSong.createMany({
    data,
  });

  return data;
}
