import { PROFILE_EMPTY_USER, PROFILE_FULL_USER, PROFILE_SHORT_USER } from './test-users';

import type { PrismaClient } from '@prisma/client';

export const LONG_INTRO_FIRST = '長いプロフィール文の 1 段落目です';
const LONG_INTRO_LAST = '長いプロフィール文の最後の段落です';
export const SHORT_INTRO = '短いプロフィール文です';
export const PROFILE_SONGS = [
  { name: 'E2E の 1 曲目', artist: 'E2E アーティスト A' },
  { name: 'E2E の 2 曲目', artist: 'E2E アーティスト B' },
] as const;

const toTiptapJson = (paragraphs: string[]) =>
  JSON.stringify({
    type: 'doc',
    content: paragraphs.map((text) => ({ type: 'paragraph', content: [{ type: 'text', text }] })),
  });

const LONG_INTRO = toTiptapJson([
  `${LONG_INTRO_FIRST}。学生時代からギターを弾いていて、社会人になってからは月に一度スタジオに入っています。最近はベースも練習中です。`,
  '好きなジャンルはオルタナ、シューゲイザー、ポストロック。歪みエフェクターを集めるのが趣味で、足元がどんどん重くなっています。',
  'セッションでは 90 年代の邦楽ロックをよく挙げます。知らない曲でもコード譜があればついていくので、気軽に誘ってください。',
  'イベントでは PA の手伝いもしています。機材トラブルのときは声をかけてもらえれば見に行きます。',
  LONG_INTRO_LAST,
]);

/** 長文ユーザーに付けるプロフィールの付帯情報。ヘッダーの見た目を実データに近づける */
const FULL_USER_DETAILS = {
  nickname: 'いいかね',
  residence: '東京都',
  twitterUsername: 'iikane_e2e',
  instagramUsername: 'iikane_e2e',
  musicLink: 'https://example.com/music',
  websiteLink: 'https://example.com',
};
const FULL_USER_TAGS = ['ギター', 'ベース', 'シューゲイザー'];

// エディタで入力して消すとこの形で保存される
const EMPTY_INTRO = JSON.stringify({ type: 'doc', content: [{ type: 'paragraph' }] });

/**
 * プロフィール閲覧の E2E 用データを作り直す。
 * spec の beforeAll はワーカーごとに走り、並列だと曲の削除と作成が入れ違って重複するので、global-setup から一度だけ呼ぶ。
 */
export async function seedProfileViewUsers(db: PrismaClient) {
  await db.user.upsert({
    where: { id: PROFILE_FULL_USER.id },
    create: { ...PROFILE_FULL_USER, ...FULL_USER_DETAILS, introduction: LONG_INTRO },
    update: { name: PROFILE_FULL_USER.name, ...FULL_USER_DETAILS, introduction: LONG_INTRO },
  });
  const tags = await Promise.all(
    FULL_USER_TAGS.map((name) =>
      db.userTag.upsert({ where: { name }, create: { name }, update: {} }),
    ),
  );
  await db.userOnUserTag.deleteMany({ where: { userId: PROFILE_FULL_USER.id } });
  await db.userOnUserTag.createMany({
    data: tags.map((tag) => ({ userId: PROFILE_FULL_USER.id, userTagId: tag.id })),
  });
  await db.user.upsert({
    where: { id: PROFILE_SHORT_USER.id },
    create: { ...PROFILE_SHORT_USER, introduction: toTiptapJson([SHORT_INTRO]) },
    update: { name: PROFILE_SHORT_USER.name, introduction: toTiptapJson([SHORT_INTRO]) },
  });
  await db.user.upsert({
    where: { id: PROFILE_EMPTY_USER.id },
    create: { ...PROFILE_EMPTY_USER, introduction: EMPTY_INTRO },
    update: { name: PROFILE_EMPTY_USER.name, introduction: EMPTY_INTRO },
  });
  await db.myBestSong.deleteMany({
    where: {
      userId: { in: [PROFILE_FULL_USER.id, PROFILE_SHORT_USER.id, PROFILE_EMPTY_USER.id] },
    },
  });
  // spotifyId を空にして Spotify API を呼ばせない
  await db.myBestSong.createMany({
    data: PROFILE_SONGS.map((song, order) => ({
      ...song,
      userId: PROFILE_FULL_USER.id,
      type: 'track' as const,
      order,
    })),
  });
}
