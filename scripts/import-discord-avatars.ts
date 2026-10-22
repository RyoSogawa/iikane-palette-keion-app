/* eslint-disable no-console -- 移行の進み具合を標準出力に出す CLI なので */
import { PrismaClient } from '@prisma/client';

import { AvatarStorageService } from '@/server/applications/services/avatar-storage.service';
import { ImportDiscordAvatarService } from '@/server/applications/services/import-discord-avatar.service';
import { createSupabaseClientForUser } from '@/utils/supabase';

/**
 * User.image が Discord の CDN を指している既存ユーザーのアバターを Supabase Storage にコピーし、
 * User.image を書き換える一回限りの移行スクリプト。
 * 既定は対象の一覧を出すだけで、--apply を付けたときだけ Storage と DB に書き込む。
 *
 *   pnpm tsx --env-file=<env ファイル> scripts/import-discord-avatars.ts [--apply]
 */
async function main() {
  const apply = process.argv.includes('--apply');
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL がありません。--env-file で env ファイルを渡してください');
  }

  const db = new PrismaClient();
  try {
    const users = await db.user.findMany({
      where: { image: { startsWith: 'https://cdn.discordapp.com/' } },
      select: { id: true, email: true, image: true },
      orderBy: { createdAt: 'asc' },
    });

    console.log(`DB: ${new URL(databaseUrl).host}`);
    console.log(`Supabase: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
    console.log(`対象: ${users.length} 人${apply ? '' : '（--apply が無いので書き込みません）'}`);
    if (!apply) {
      users.forEach((user) => console.log(`  ${user.id} ${user.image}`));
      return;
    }

    let failed = 0;
    // Discord の CDN と Storage に負荷をかけないよう、1 人ずつ順に処理する
    for (const user of users) {
      const importDiscordAvatar = new ImportDiscordAvatarService(
        new AvatarStorageService(createSupabaseClientForUser(user)),
        (id, image) => db.user.update({ where: { id }, data: { image } }),
      );
      try {
        const imagePath = await importDiscordAvatar.invoke(user);
        console.log(`  OK   ${user.id} -> ${imagePath}`);
      } catch (error) {
        failed += 1;
        console.error(`  FAIL ${user.id}`, error);
      }
    }
    console.log(`完了: 成功 ${users.length - failed} 人 / 失敗 ${failed} 人`);
    if (failed > 0) {
      process.exitCode = 1;
    }
  } finally {
    await db.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
