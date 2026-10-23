import { fakerJA } from '@faker-js/faker';
import { type Prisma, PrismaClient, type User } from '@prisma/client';

const bandIds = [
  'oretachi-recchiri',
  'adrenaline',
  'marian-jesus-cry',
  'death-eaters',
  'fuwari',
  'zutt-kyun',
];

const parts = ['Vo', 'Gt', 'Ba', 'Dr', 'Key', 'Vo&Gt', 'Vo&Ba'];

export default async function seedUserOnBand(users: User[]) {
  const prisma = new PrismaClient();
  // usersとbandsを組み合わせてUserOnBandを作成する
  // 1つのbandに対してuserを4~12人ランダムに割り当てる
  const data: Prisma.UserOnBandCreateManyInput[] = bandIds
    .map((bandId) => {
      const userCount = Math.floor(Math.random() * 9) + 4;
      const usersInBand = users.sort(() => Math.random() - 0.5).slice(0, userCount);
      return usersInBand.map(
        (user, index) =>
          ({
            userId: user.id,
            bandId,
            order: index + 1,
            userName: Math.random() > 0.9 ? fakerJA.person.fullName() : null,
            part: parts[Math.floor(Math.random() * parts.length)] ?? null,
          }) satisfies Prisma.UserOnBandCreateManyInput,
      );
    })
    .flat();
  await prisma.userOnBand.createMany({
    data,
  });

  return data;
}
