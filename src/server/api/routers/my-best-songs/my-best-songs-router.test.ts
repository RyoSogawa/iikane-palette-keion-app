import { beforeEach, describe, expect, it, vi } from 'vitest';

import { appRouter } from '@/server/api/root';
import { createCallerFactory } from '@/server/api/trpc';

import type { Session } from 'next-auth';

const mocks = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
}));

vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock('@/server/auth', () => ({ getServerAuthSession: vi.fn() }));
vi.mock('@/server/db', () => ({ db: {} }));

const USER_ID = 'user-1';
const PROFILE_PATH = `/members/${USER_ID}/profile`;

const createDb = () => {
  const db = {
    myBestSong: {
      aggregate: vi.fn().mockResolvedValue({ _max: { order: 1 } }),
      create: vi.fn().mockResolvedValue({ id: 'song-new' }),
      findFirst: vi.fn().mockResolvedValue({ userId: USER_ID, order: 0 }),
      findUnique: vi.fn().mockResolvedValue({ id: 'song-1', userId: USER_ID, order: 0 }),
      delete: vi.fn().mockResolvedValue({}),
      update: vi.fn().mockResolvedValue({ id: 'song-1', userId: USER_ID, order: 2 }),
      updateMany: vi.fn().mockResolvedValue({}),
    },
    $transaction: vi.fn((fn: (tx: unknown) => unknown) => fn(db)),
  };
  return db;
};

const session: Session = {
  expires: '2099-12-31T00:00:00.000Z',
  user: { id: USER_ID, isAdmin: false },
};

const callerFor = (db: ReturnType<typeof createDb>) =>
  createCallerFactory(appRouter)({ db: db as never, session, headers: new Headers() });

beforeEach(() => {
  vi.clearAllMocks();
});

describe('myBestSongs ルーター', () => {
  it('曲を追加すると、その人のプロフィールページを再検証する', async () => {
    await callerFor(createDb()).myBestSongs.create({
      userId: USER_ID,
      spotifyId: 'spotify-1',
      name: '曲',
      artist: 'アーティスト',
      type: 'track',
    });

    expect(mocks.revalidatePath).toHaveBeenCalledWith(PROFILE_PATH);
  });

  it('曲を削除すると、その人のプロフィールページを再検証する', async () => {
    await callerFor(createDb()).myBestSongs.delete({ id: 'song-1' });

    expect(mocks.revalidatePath).toHaveBeenCalledWith(PROFILE_PATH);
  });

  it('曲を並べ替えると、その人のプロフィールページを再検証する', async () => {
    await callerFor(createDb()).myBestSongs.sort({ id: 'song-1', newOrder: 2 });

    expect(mocks.revalidatePath).toHaveBeenCalledWith(PROFILE_PATH);
  });
});
