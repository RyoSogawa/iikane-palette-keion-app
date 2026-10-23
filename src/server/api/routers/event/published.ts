import { type Prisma } from '@prisma/client';

/** 公開ルートに出してよいイベントの条件。下書きは管理画面以外に出さない */
export const publishedEventWhere = { isDraft: false } satisfies Prisma.EventWhereInput;

/** イベントとの中間テーブル（レク王など）を、公開イベントのものだけに絞る条件 */
export const onPublishedEvent = { event: publishedEventWhere } satisfies {
  event: Prisma.EventWhereInput;
};
