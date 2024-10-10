import { PrismaClient } from '@prisma/client';

import seedMyBestSong from './my-best-song';
import seedUser from './user';
import seedUserOnBand from './user-on-band';
import seedUserOnUserTag from './user-on-user-tag';
import seedUserTag from './user-tag';

const prisma = new PrismaClient();

async function main() {
  const users = await seedUser();
  const userTags = await seedUserTag();
  await seedUserOnUserTag(users, userTags);
  await seedMyBestSong(users);
  await seedUserOnBand(users);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
