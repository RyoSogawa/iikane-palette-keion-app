import { type Prisma } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { appRouter } from '@/server/api/root';
import { eventDetailSelect } from '@/server/api/routers/event/event-detail-select';
import { createCallerFactory } from '@/server/api/trpc';

vi.mock('@/server/auth', () => ({ getServerAuthSession: vi.fn() }));
vi.mock('@/server/db', () => ({ db: {} }));

const db = {
  event: { findMany: vi.fn(), findFirst: vi.fn() },
  user: {
    findMany: vi.fn<(args: Prisma.UserFindManyArgs) => Promise<unknown[]>>(),
    findUnique: vi.fn<(args: Prisma.UserFindUniqueArgs) => Promise<unknown>>(),
  },
};

const caller = createCallerFactory(appRouter)({
  db: db as never,
  session: null,
  headers: new Headers(),
});

const PUBLISHED_ONLY = { event: { isDraft: false } };

beforeEach(() => {
  vi.clearAllMocks();
  db.event.findMany.mockResolvedValue([]);
  db.event.findFirst.mockResolvedValue(null);
  db.user.findMany.mockResolvedValue([]);
  db.user.findUnique.mockResolvedValue(null);
});

describe('公開 API は下書きのイベントを返さない', () => {
  it('event.getAll は公開イベントだけを取る', async () => {
    await caller.event.getAll();

    expect(db.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { isDraft: false } }),
    );
  });

  it('event.findById は公開イベントだけを取り、レク王の回数も公開イベントで数える', async () => {
    await caller.event.findById({ id: 'event-1' });

    expect(db.event.findFirst).toHaveBeenCalledWith({
      where: { id: 'event-1', isDraft: false },
      select: eventDetailSelect,
    });
    expect(
      eventDetailSelect.recreationKingUsers.select.user.select.recreationKingEvents.where,
    ).toEqual(PUBLISHED_ONLY);
  });

  it('user.getAll のレク王イベントは公開イベントだけ', async () => {
    await caller.user.getAll();

    const recreationKingEvents = db.user.findMany.mock.calls[0]?.[0].select?.recreationKingEvents;
    expect(typeof recreationKingEvents === 'object' && recreationKingEvents.where).toEqual(
      PUBLISHED_ONLY,
    );
  });

  it('user.findById のレク王イベントは公開イベントだけ', async () => {
    await caller.user.findById({ id: 'user-1' });

    const recreationKingEvents = db.user.findUnique.mock.calls[0]?.[0].select?.recreationKingEvents;
    expect(typeof recreationKingEvents === 'object' && recreationKingEvents.where).toEqual(
      PUBLISHED_ONLY,
    );
  });
});
