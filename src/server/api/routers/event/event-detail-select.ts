import { type Prisma } from '@prisma/client';

import { publishedEventRelationWhere } from '@/server/api/routers/event/published';

/**
 * イベント詳細ページとバンド詳細ページが表示する項目。
 * 管理画面のプレビューも同じ形で取得し、公開ページと同じコンポーネントで描画する。
 */
export const eventDetailSelect = {
  id: true,
  dateFrom: true,
  dateTo: true,
  name: true,
  description: true,
  image: true,
  movie: true,
  driveLink: true,
  recreationKingUsers: {
    select: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          recreationKingEvents: {
            where: publishedEventRelationWhere,
            select: {
              eventId: true,
            },
          },
        },
      },
    },
  },
  Band: {
    select: {
      id: true,
      name: true,
      photo: true,
      image: true,
      typoImage: true,
      description: true,
      liveOrder: true,
      movie: true,
      members: {
        select: {
          userName: true,
          order: true,
          part: true,
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          order: 'asc',
        },
      },
    },
    orderBy: {
      liveOrder: 'asc',
    },
  },
} satisfies Prisma.EventSelect;

export type EventDetail = Prisma.EventGetPayload<{ select: typeof eventDetailSelect }>;
