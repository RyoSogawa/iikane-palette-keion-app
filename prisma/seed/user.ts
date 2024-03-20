import { PrismaClient, type User } from '@prisma/client';

export default async function seedUser() {
  const prisma = new PrismaClient();
  const data: User[] = Array(100)
    .fill(0)
    .map((_, i) => ({
      id: i.toString(),
      name: `テストユーザー${i}`,
      email: `email${i}@example.com`,
      createdAt: new Date(),
      nickname: `ニックネーム${i}`,
      residence: `住所${i}`,
      introduction: `自己紹介${i}`,
      image: `https://placeholder.com`,
      websiteLink: `https://example.com/website${i}`,
      twitterLink: `https://example.com/twitter${i}`,
      instagramLink: `https://example.com/instagram${i}`,
      podcastLink: `https://example.com/podcast${i}`,
      musicLink: `https://example.com/music${i}`,
      emailVerified: null,
    }));
  await prisma.user.createMany({
    data,
  });

  return data;
}
