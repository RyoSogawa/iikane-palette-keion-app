import { Prisma } from '@prisma/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { appRouter } from '@/server/api/root';
import { createCallerFactory } from '@/server/api/trpc';

import type { Session } from 'next-auth';

const mocks = vi.hoisted(() => ({ getSeveralTracks: vi.fn() }));

vi.mock('@/server/auth', () => ({ getServerAuthSession: vi.fn() }));
vi.mock('@/server/db', () => ({ db: {} }));
vi.mock('@/server/applications/services/spotify-api.service', () => ({
  SpotifyApiService: class {
    getSeveralTracks = mocks.getSeveralTracks;
  },
}));

const NOW = new Date('2026-11-11T12:00:00Z');
const JOINED_RECENTLY = new Date('2026-11-11T10:00:00Z');
const JOINED_YESTERDAY = new Date('2026-11-10T11:00:00Z');
const SINCE = new Date('2026-11-10T12:00:00Z');

const createDb = (myJoinedAt: Date | null = JOINED_RECENTLY) => {
  const db = {
    jamSessionParticipant: {
      findUnique: vi
        .fn()
        .mockResolvedValue(
          myJoinedAt === undefined
            ? null
            : { joinedAt: myJoinedAt, parts: ['guitar'], partNote: null, roots: ['ロック'] },
        ),
      findMany: vi.fn().mockResolvedValue([]),
      upsert: vi.fn().mockResolvedValue({}),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    jamSessionSong: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue({ id: 'song-1', proposerId: 'user-1' }),
      create: vi.fn().mockResolvedValue({ id: 'song-new' }),
      delete: vi.fn().mockResolvedValue({}),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    jamSessionEntry: {
      deleteMany: vi.fn().mockResolvedValue({}),
      createMany: vi.fn().mockResolvedValue({}),
    },
    $transaction: vi.fn((operations: unknown[]) => Promise.all(operations)),
  };
  return db;
};

type Db = ReturnType<typeof createDb>;

const sessionOf = (userId = 'user-1', isAdmin = false): Session => ({
  expires: '2099-12-31T00:00:00.000Z',
  user: { id: userId, isAdmin },
});

const callerFor = (db: Db, session: Session | null = sessionOf()) =>
  createCallerFactory(appRouter)({ db: db as never, session, headers: new Headers() });

const callByPath = (caller: object, path: string) => {
  const procedure = path
    .split('.')
    .reduce<unknown>((node, key) => (node as Record<string, unknown>)[key], caller);
  return (procedure as (input?: unknown) => Promise<unknown>)();
};

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(NOW);
  vi.clearAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('jamSession の認可', () => {
  // 手続きを足したら自動で対象に入るよう、一覧はルーターから取る
  const paths = Object.keys(appRouter._def.procedures).filter((path) =>
    path.startsWith('jamSession.'),
  );
  const activeOnlyPaths = [
    'jamSession.createSong',
    'jamSession.setMyParts',
    'jamSession.setPlayed',
  ];

  it('jamSession の手続きを一覧として取れている', () => {
    expect(paths).toEqual(
      expect.arrayContaining([
        'jamSession.board',
        'jamSession.join',
        'jamSession.leave',
        'jamSession.deleteSong',
        ...activeOnlyPaths,
      ]),
    );
  });

  it.each(paths)('未ログインなら %s は UNAUTHORIZED', async (path) => {
    await expect(callByPath(callerFor({} as Db, null), path)).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
    });
  });

  it.each(activeOnlyPaths)('参加していなければ %s は FORBIDDEN', async (path) => {
    await expect(callByPath(callerFor(createDb(null)), path)).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });

  it.each(activeOnlyPaths)('参加から 24 時間たっていれば %s は FORBIDDEN', async (path) => {
    await expect(callByPath(callerFor(createDb(JOINED_YESTERDAY)), path)).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });
});

describe('jamSession.board', () => {
  it('参加中のメンバーと、参加中のメンバーの挙手だけを取る', async () => {
    const db = createDb();

    await callerFor(db).jamSession.board();

    expect(db.jamSessionParticipant.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { joinedAt: { gt: SINCE } } }),
    );
    const songArgs = db.jamSessionSong.findMany.mock.calls[0]?.[0] as {
      where?: unknown;
      select: { entries: { where: unknown } };
    };
    expect(songArgs.where).toBeUndefined();
    expect(songArgs.select.entries.where).toEqual({
      user: { jamSessionProfile: { is: { joinedAt: { gt: SINCE } } } },
    });
  });

  it('メンバーのメールアドレスは返さない', async () => {
    const db = createDb();

    await callerFor(db).jamSession.board();

    const participantArgs = db.jamSessionParticipant.findMany.mock.calls[0]?.[0] as {
      select: { user: { select: Record<string, boolean> } };
    };
    expect(participantArgs.select.user.select).toEqual({ id: true, name: true, image: true });
  });

  it('自分の参加状態とプロフィールを返す', async () => {
    const result = await callerFor(
      createDb(JOINED_YESTERDAY),
      sessionOf('user-1', true),
    ).jamSession.board();

    expect(result.viewer).toEqual({
      userId: 'user-1',
      isAdmin: true,
      isActive: false,
      profile: { parts: ['guitar'], partNote: null, roots: ['ロック'] },
    });
  });
});

describe('jamSession.join', () => {
  const input = () => ({
    parts: ['vocal' as const, 'other' as const],
    partNote: 'ハーモニカ',
    roots: ['ロック'],
  });

  it('未参加なら、パートとルーツを保存して今の時刻で参加する', async () => {
    const db = createDb(null);

    await callerFor(db).jamSession.join(input());

    const data = {
      parts: ['vocal', 'other'],
      partNote: 'ハーモニカ',
      roots: ['ロック'],
      joinedAt: NOW,
    };
    expect(db.jamSessionParticipant.upsert).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      create: { userId: 'user-1', ...data },
      update: data,
    });
  });

  it('参加中に呼べば、参加した時刻は変えずにプロフィールだけ直す', async () => {
    const db = createDb(JOINED_RECENTLY);

    await callerFor(db).jamSession.join(input());

    expect(db.jamSessionParticipant.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({ joinedAt: JOINED_RECENTLY }) as unknown,
      }),
    );
  });
});

describe('jamSession.leave', () => {
  it('自分は参加していなくても退出できる', async () => {
    const db = createDb(null);

    await callerFor(db).jamSession.leave();

    expect(db.jamSessionParticipant.updateMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      data: { joinedAt: null },
    });
  });

  it('参加中なら、ほかのメンバーを退出させられる', async () => {
    const db = createDb();

    await callerFor(db).jamSession.leave({ userId: 'user-2' });

    expect(db.jamSessionParticipant.updateMany).toHaveBeenCalledWith({
      where: { userId: 'user-2' },
      data: { joinedAt: null },
    });
  });

  it('参加していなければ、ほかのメンバーは退出させられない', async () => {
    const db = createDb(null);

    await expect(callerFor(db).jamSession.leave({ userId: 'user-2' })).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
    expect(db.jamSessionParticipant.updateMany).not.toHaveBeenCalled();
  });
});

describe('jamSession.createSong', () => {
  it('自由入力の曲は、曲と自分の挙手を 1 回の作成で入れる', async () => {
    const db = createDb();

    await callerFor(db).jamSession.createSong({
      artist: 'Oasis',
      parts: ['guitar', 'other'],
      partNote: 'タンバリン',
    });

    expect(mocks.getSeveralTracks).not.toHaveBeenCalled();
    expect(db.jamSessionSong.create).toHaveBeenCalledWith({
      data: {
        proposerId: 'user-1',
        spotifyId: null,
        name: null,
        artist: 'Oasis',
        entries: {
          create: [
            { userId: 'user-1', part: 'guitar', partNote: null },
            { userId: 'user-1', part: 'other', partNote: 'タンバリン' },
          ],
        },
      },
      select: { id: true },
    });
  });

  it('Spotify の曲は、曲名とアーティスト名を Spotify から取り直す', async () => {
    const db = createDb();
    mocks.getSeveralTracks.mockResolvedValue({
      tracks: [{ name: 'Wonderwall', artists: [{ name: 'Oasis' }, { name: 'Noel' }] }],
    });

    await callerFor(db).jamSession.createSong({
      spotifyId: 'track-1',
      name: '偽の曲名',
      artist: '偽のアーティスト',
      parts: ['vocal'],
    });

    expect(mocks.getSeveralTracks).toHaveBeenCalledWith(['track-1']);
    expect(db.jamSessionSong.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          spotifyId: 'track-1',
          name: 'Wonderwall',
          artist: 'Oasis, Noel',
        }) as unknown,
      }),
    );
  });

  it.each([
    ['取得に失敗した', undefined],
    ['曲が無い', { tracks: [] }],
    ['曲が null', { tracks: [null] }],
  ])('Spotify から曲を%sときは登録しない', async (_label, response) => {
    const db = createDb();
    mocks.getSeveralTracks.mockResolvedValue(response);

    await expect(
      callerFor(db).jamSession.createSong({ spotifyId: 'track-1', parts: ['vocal'] }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    expect(db.jamSessionSong.create).not.toHaveBeenCalled();
  });

  it('すでに挙がっている Spotify の曲は CONFLICT', async () => {
    const db = createDb();
    mocks.getSeveralTracks.mockResolvedValue({
      tracks: [{ name: 'Wonderwall', artists: [{ name: 'Oasis' }] }],
    });
    db.jamSessionSong.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );

    await expect(
      callerFor(db).jamSession.createSong({ spotifyId: 'track-1', parts: ['vocal'] }),
    ).rejects.toMatchObject({ code: 'CONFLICT' });
  });
});

describe('jamSession.deleteSong', () => {
  it('挙げた本人は消せる', async () => {
    const db = createDb();

    await callerFor(db).jamSession.deleteSong({ songId: 'song-1' });

    expect(db.jamSessionSong.delete).toHaveBeenCalledWith({ where: { id: 'song-1' } });
  });

  it('管理者はほかの人の曲も消せる', async () => {
    const db = createDb();

    await callerFor(db, sessionOf('admin', true)).jamSession.deleteSong({ songId: 'song-1' });

    expect(db.jamSessionSong.delete).toHaveBeenCalled();
  });

  it('提案者が退会した曲は管理者だけが消せる', async () => {
    const db = createDb();
    db.jamSessionSong.findUnique.mockResolvedValue({ id: 'song-1', proposerId: null });

    await expect(callerFor(db).jamSession.deleteSong({ songId: 'song-1' })).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });

  it('ほかのメンバーは FORBIDDEN', async () => {
    const db = createDb();

    await expect(
      callerFor(db, sessionOf('user-2')).jamSession.deleteSong({ songId: 'song-1' }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    expect(db.jamSessionSong.delete).not.toHaveBeenCalled();
  });

  it('無い曲は NOT_FOUND', async () => {
    const db = createDb();
    db.jamSessionSong.findUnique.mockResolvedValue(null);

    await expect(callerFor(db).jamSession.deleteSong({ songId: 'missing' })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });
});

describe('jamSession.setMyParts', () => {
  it('自分のパートだけを消して入れ直す', async () => {
    const db = createDb();

    await callerFor(db).jamSession.setMyParts({
      songId: 'song-1',
      parts: ['other', 'bass'],
      partNote: 'ハーモニカ',
    });

    expect(db.jamSessionEntry.deleteMany).toHaveBeenCalledWith({
      where: { songId: 'song-1', userId: 'user-1' },
    });
    expect(db.jamSessionEntry.createMany).toHaveBeenCalledWith({
      data: [
        { songId: 'song-1', userId: 'user-1', part: 'other', partNote: 'ハーモニカ' },
        { songId: 'song-1', userId: 'user-1', part: 'bass', partNote: null },
      ],
    });
  });

  it('無い曲は NOT_FOUND', async () => {
    const db = createDb();
    db.jamSessionSong.findUnique.mockResolvedValue(null);

    await expect(
      callerFor(db).jamSession.setMyParts({ songId: 'missing', parts: ['bass'] }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    expect(db.jamSessionEntry.deleteMany).not.toHaveBeenCalled();
  });
});

describe('jamSession.setPlayed', () => {
  it('演奏済みにすると今の時刻を入れ、戻すと消す', async () => {
    const db = createDb();
    const caller = callerFor(db);

    await caller.jamSession.setPlayed({ songId: 'song-1', played: true });
    await caller.jamSession.setPlayed({ songId: 'song-1', played: false });

    expect(db.jamSessionSong.updateMany.mock.calls).toEqual([
      [{ where: { id: 'song-1' }, data: { playedAt: NOW } }],
      [{ where: { id: 'song-1' }, data: { playedAt: null } }],
    ]);
  });

  it('無い曲は NOT_FOUND', async () => {
    const db = createDb();
    db.jamSessionSong.updateMany.mockResolvedValue({ count: 0 });

    await expect(
      callerFor(db).jamSession.setPlayed({ songId: 'missing', played: true }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});
