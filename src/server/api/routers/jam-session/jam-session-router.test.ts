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
const SPOTIFY_ID = '4gzpq5DPGxSnKTe4SA8HAU';
const SESSION = {
  id: 'session-1',
  name: '11 月のセッション',
  heldOn: new Date('2026-11-11'),
  creatorId: 'user-1',
};

const createDb = (myJoinedAt: Date | null = JOINED_RECENTLY) => {
  const db = {
    jamSession: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue(SESSION),
      create: vi.fn().mockResolvedValue({ id: 'session-new' }),
      update: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue({}),
    },
    jamSessionProfile: {
      findUnique: vi
        .fn()
        .mockResolvedValue({ parts: ['guitar'], partNote: null, roots: ['ロック'] }),
      upsert: vi.fn().mockResolvedValue({}),
    },
    jamSessionParticipant: {
      findUnique: vi.fn().mockResolvedValue({ joinedAt: myJoinedAt }),
      findMany: vi.fn().mockResolvedValue([]),
      upsert: vi.fn().mockResolvedValue({}),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    jamSessionSong: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi
        .fn()
        .mockResolvedValue({ id: 'song-1', sessionId: 'session-1', proposerId: 'user-1' }),
      create: vi.fn().mockResolvedValue({ id: 'song-new' }),
      deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
      update: vi.fn().mockResolvedValue({}),
    },
    myBestSong: {
      findMany: vi.fn().mockResolvedValue([]),
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

const myParticipation = { sessionId_userId: { sessionId: 'session-1', userId: 'user-1' } };

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

  const callByPath = (caller: object, path: string, input?: unknown) => {
    const procedure = path
      .split('.')
      .reduce<unknown>((node, key) => (node as Record<string, unknown>)[key], caller);
    return (procedure as (input?: unknown) => Promise<unknown>)(input);
  };

  it('jamSession の手続きを一覧として取れている', () => {
    expect(paths).toEqual(
      expect.arrayContaining([
        'jamSession.list',
        'jamSession.create',
        'jamSession.update',
        'jamSession.delete',
        'jamSession.board',
        'jamSession.join',
        'jamSession.leave',
        'jamSession.createSong',
        'jamSession.deleteSong',
        'jamSession.setMyParts',
        'jamSession.setPlayed',
        'jamSession.sharedArtists',
      ]),
    );
  });

  it.each(paths)('未ログインなら %s は UNAUTHORIZED', async (path) => {
    await expect(callByPath(callerFor({} as Db, null), path)).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
    });
  });

  const activeOnly: Array<[string, unknown]> = [
    [
      'jamSession.createSong',
      { sessionId: 'session-1', song: { artist: 'Oasis', parts: ['vocal'] } },
    ],
    ['jamSession.setMyParts', { songId: 'song-1', parts: ['vocal'] }],
    ['jamSession.setPlayed', { songId: 'song-1', played: true }],
  ];

  it.each(activeOnly)('参加していなければ %s は FORBIDDEN', async (path, input) => {
    const db = createDb(null);
    await expect(callByPath(callerFor(db), path, input)).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });

  it.each(activeOnly)('参加から 24 時間たっていれば %s は FORBIDDEN', async (path, input) => {
    await expect(
      callByPath(callerFor(createDb(JOINED_YESTERDAY)), path, input),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('曲の操作は、その曲のセッションに参加しているかで判定する', async () => {
    const db = createDb();
    db.jamSessionSong.findUnique.mockResolvedValue({
      id: 'song-1',
      sessionId: 'session-2',
      proposerId: 'user-1',
    });

    await callerFor(db).jamSession.setPlayed({ songId: 'song-1', played: true });

    expect(db.jamSessionParticipant.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { sessionId_userId: { sessionId: 'session-2', userId: 'user-1' } },
      }),
    );
  });
});

describe('セッションの作成・変更・削除', () => {
  it('一覧は日付の新しい順に、曲の数つきで取る', async () => {
    const db = createDb();

    await callerFor(db).jamSession.list();

    expect(db.jamSession.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        name: true,
        heldOn: true,
        creatorId: true,
        _count: { select: { songs: true } },
      },
      orderBy: [{ heldOn: 'desc' }, { createdAt: 'desc' }],
    });
  });

  it('ログインしていれば誰でも作れ、作った人として記録する', async () => {
    const db = createDb();

    const result = await callerFor(db, sessionOf('user-2')).jamSession.create({
      name: '11 月のセッション',
      heldOn: '2026-11-11',
    });

    expect(result).toEqual({ id: 'session-new' });
    expect(db.jamSession.create).toHaveBeenCalledWith({
      data: {
        name: '11 月のセッション',
        heldOn: new Date('2026-11-11T00:00:00.000Z'),
        creatorId: 'user-2',
      },
      select: { id: true },
    });
  });

  const session = { name: '変更後', heldOn: '2026-11-12' };

  it.each([
    ['作った人', sessionOf('user-1')],
    ['管理者', sessionOf('admin', true)],
  ])('%sは変更と削除ができる', async (_label, auth) => {
    const db = createDb();
    const caller = callerFor(db, auth);

    await caller.jamSession.update({ sessionId: 'session-1', session });
    await caller.jamSession.delete({ sessionId: 'session-1' });

    expect(db.jamSession.update).toHaveBeenCalledWith({
      where: { id: 'session-1' },
      data: { name: '変更後', heldOn: new Date('2026-11-12T00:00:00.000Z') },
    });
    expect(db.jamSession.delete).toHaveBeenCalledWith({ where: { id: 'session-1' } });
  });

  it('ほかのメンバーは変更も削除も FORBIDDEN', async () => {
    const db = createDb();
    const caller = callerFor(db, sessionOf('user-2'));

    await expect(
      caller.jamSession.update({ sessionId: 'session-1', session }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    await expect(caller.jamSession.delete({ sessionId: 'session-1' })).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
    expect(db.jamSession.update).not.toHaveBeenCalled();
    expect(db.jamSession.delete).not.toHaveBeenCalled();
  });

  it('無いセッションは NOT_FOUND', async () => {
    const db = createDb();
    db.jamSession.findUnique.mockResolvedValue(null);

    await expect(callerFor(db).jamSession.delete({ sessionId: 'missing' })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
    await expect(callerFor(db).jamSession.board({ sessionId: 'missing' })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });
});

describe('jamSession.board', () => {
  it('そのセッションに参加中のメンバーと、その人たちの挙手だけを取る', async () => {
    const db = createDb();

    await callerFor(db).jamSession.board({ sessionId: 'session-1' });

    expect(db.jamSessionParticipant.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { sessionId: 'session-1', joinedAt: { gt: SINCE } } }),
    );
    const songArgs = db.jamSessionSong.findMany.mock.calls[0]?.[0] as {
      where: unknown;
      select: { entries: { where: unknown } };
    };
    expect(songArgs.where).toEqual({ sessionId: 'session-1' });
    expect(songArgs.select.entries.where).toEqual({
      user: { jamSessionJoins: { some: { sessionId: 'session-1', joinedAt: { gt: SINCE } } } },
    });
  });

  it('メンバーのメールアドレスは返さず、パートとルーツはプロフィールから並べ直す', async () => {
    const db = createDb();
    db.jamSessionParticipant.findMany.mockResolvedValue([
      {
        userId: 'user-2',
        joinedAt: JOINED_RECENTLY,
        user: {
          id: 'user-2',
          name: 'けん',
          image: null,
          jamSessionProfile: { parts: ['vocal'], partNote: null, roots: ['ロック'] },
        },
      },
    ]);

    const result = await callerFor(db).jamSession.board({ sessionId: 'session-1' });

    const participantArgs = db.jamSessionParticipant.findMany.mock.calls[0]?.[0] as {
      select: { user: { select: Record<string, unknown> } };
    };
    expect(participantArgs.select.user.select).not.toHaveProperty('email');
    expect(result.participants).toEqual([
      {
        userId: 'user-2',
        joinedAt: JOINED_RECENTLY,
        parts: ['vocal'],
        partNote: null,
        roots: ['ロック'],
        user: { id: 'user-2', name: 'けん', image: null },
      },
    ]);
  });

  it('自分の参加状態とプロフィール、セッションを変えられるかを返す', async () => {
    const result = await callerFor(
      createDb(JOINED_YESTERDAY),
      sessionOf('admin', true),
    ).jamSession.board({
      sessionId: 'session-1',
    });

    expect(result.session).toEqual(SESSION);
    expect(result.viewer).toEqual({
      userId: 'admin',
      isAdmin: true,
      isActive: false,
      canManageSession: true,
      profile: { parts: ['guitar'], partNote: null, roots: ['ロック'] },
    });
  });
});

describe('jamSession.join', () => {
  const input = () => ({
    sessionId: 'session-1',
    profile: {
      parts: ['vocal' as const, 'other' as const],
      partNote: 'ハーモニカ',
      roots: ['ロック'],
    },
  });
  const profile = { parts: ['vocal', 'other'], partNote: 'ハーモニカ', roots: ['ロック'] };

  it('プロフィールを保存し、未参加なら今の時刻でそのセッションに参加する', async () => {
    const db = createDb(null);

    await callerFor(db).jamSession.join(input());

    expect(db.jamSessionProfile.upsert).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      create: { userId: 'user-1', ...profile },
      update: profile,
    });
    expect(db.jamSessionParticipant.upsert).toHaveBeenCalledWith({
      where: myParticipation,
      create: { sessionId: 'session-1', userId: 'user-1', joinedAt: NOW },
      update: { joinedAt: NOW },
    });
  });

  it('参加中に呼べば、参加した時刻は変えない', async () => {
    const db = createDb(JOINED_RECENTLY);

    await callerFor(db).jamSession.join(input());

    expect(db.jamSessionParticipant.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ update: { joinedAt: JOINED_RECENTLY } }),
    );
  });

  it('無いセッションには参加できない', async () => {
    const db = createDb(null);
    db.jamSession.findUnique.mockResolvedValue(null);

    await expect(callerFor(db).jamSession.join(input())).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
    expect(db.jamSessionParticipant.upsert).not.toHaveBeenCalled();
  });
});

describe('jamSession.leave', () => {
  it('自分は参加していなくても退出できる', async () => {
    const db = createDb(null);

    await callerFor(db).jamSession.leave({ sessionId: 'session-1' });

    expect(db.jamSessionParticipant.updateMany).toHaveBeenCalledWith({
      where: { sessionId: 'session-1', userId: 'user-1' },
      data: { joinedAt: null },
    });
  });

  it('参加中なら、同じセッションのほかのメンバーを退出させられる', async () => {
    const db = createDb();

    await callerFor(db).jamSession.leave({ sessionId: 'session-1', userId: 'user-2' });

    expect(db.jamSessionParticipant.updateMany).toHaveBeenCalledWith({
      where: { sessionId: 'session-1', userId: 'user-2' },
      data: { joinedAt: null },
    });
  });

  it('参加していなければ、ほかのメンバーは退出させられない', async () => {
    const db = createDb(null);

    await expect(
      callerFor(db).jamSession.leave({ sessionId: 'session-1', userId: 'user-2' }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    expect(db.jamSessionParticipant.updateMany).not.toHaveBeenCalled();
  });
});

describe('jamSession.createSong', () => {
  it('自由入力の曲は、そのセッションに曲と自分の挙手を 1 回の作成で入れる', async () => {
    const db = createDb();

    await callerFor(db).jamSession.createSong({
      sessionId: 'session-1',
      song: { artist: 'Oasis', parts: ['guitar', 'other'], partNote: 'タンバリン' },
    });

    expect(mocks.getSeveralTracks).not.toHaveBeenCalled();
    expect(db.jamSessionSong.create).toHaveBeenCalledWith({
      data: {
        sessionId: 'session-1',
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
      tracks: [
        { id: SPOTIFY_ID, name: 'Wonderwall', artists: [{ name: 'Oasis' }, { name: 'Noel' }] },
      ],
    });

    await callerFor(db).jamSession.createSong({
      sessionId: 'session-1',
      song: {
        spotifyId: SPOTIFY_ID,
        name: '偽の曲名',
        artist: '偽のアーティスト',
        parts: ['vocal'],
      },
    });

    expect(mocks.getSeveralTracks).toHaveBeenCalledWith([SPOTIFY_ID]);
    expect(db.jamSessionSong.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          spotifyId: SPOTIFY_ID,
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
    ['別の曲', { tracks: [{ id: '0000000000000000000000', name: 'x', artists: [] }] }],
  ])('Spotify から曲を%sときは登録しない', async (_label, response) => {
    const db = createDb();
    mocks.getSeveralTracks.mockResolvedValue(response);

    await expect(
      callerFor(db).jamSession.createSong({
        sessionId: 'session-1',
        song: { spotifyId: SPOTIFY_ID, parts: ['vocal'] },
      }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    expect(db.jamSessionSong.create).not.toHaveBeenCalled();
  });

  it('同じセッションにすでにある Spotify の曲は CONFLICT', async () => {
    const db = createDb();
    mocks.getSeveralTracks.mockResolvedValue({
      tracks: [{ id: SPOTIFY_ID, name: 'Wonderwall', artists: [{ name: 'Oasis' }] }],
    });
    db.jamSessionSong.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );

    await expect(
      callerFor(db).jamSession.createSong({
        sessionId: 'session-1',
        song: { spotifyId: SPOTIFY_ID, parts: ['vocal'] },
      }),
    ).rejects.toMatchObject({ code: 'CONFLICT' });
  });
});

describe('jamSession.deleteSong', () => {
  it('挙げた本人は消せる', async () => {
    const db = createDb();

    await callerFor(db).jamSession.deleteSong({ songId: 'song-1' });

    expect(db.jamSessionSong.deleteMany).toHaveBeenCalledWith({ where: { id: 'song-1' } });
  });

  it('管理者はほかの人の曲も消せる', async () => {
    const db = createDb();

    await callerFor(db, sessionOf('admin', true)).jamSession.deleteSong({ songId: 'song-1' });

    expect(db.jamSessionSong.deleteMany).toHaveBeenCalled();
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
    expect(db.jamSessionSong.deleteMany).not.toHaveBeenCalled();
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
      skipDuplicates: true,
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

    expect(db.jamSessionSong.update.mock.calls).toEqual([
      [{ where: { id: 'song-1' }, data: { playedAt: NOW } }],
      [{ where: { id: 'song-1' }, data: { playedAt: null } }],
    ]);
  });

  it('無い曲は NOT_FOUND', async () => {
    const db = createDb();
    db.jamSessionSong.findUnique.mockResolvedValue(null);

    await expect(
      callerFor(db).jamSession.setPlayed({ songId: 'missing', played: true }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});

describe('jamSession.sharedArtists', () => {
  it('そのセッションに参加中のメンバーの My Best Songs から、2 人以上のアーティストを返す', async () => {
    const db = createDb();
    db.jamSessionParticipant.findMany.mockResolvedValue([
      { userId: 'user-1' },
      { userId: 'user-2' },
    ]);
    db.myBestSong.findMany.mockResolvedValue([
      { userId: 'user-1', artist: 'Oasis' },
      { userId: 'user-2', artist: 'Oasis' },
      { userId: 'user-2', artist: 'Blur' },
    ]);

    const result = await callerFor(db).jamSession.sharedArtists({ sessionId: 'session-1' });

    expect(db.jamSessionParticipant.findMany).toHaveBeenCalledWith({
      where: { sessionId: 'session-1', joinedAt: { gt: SINCE } },
      select: { userId: true },
    });
    expect(db.myBestSong.findMany).toHaveBeenCalledWith({
      where: { userId: { in: ['user-1', 'user-2'] } },
      select: { userId: true, artist: true },
      orderBy: { createdAt: 'asc' },
    });
    expect(result).toEqual([{ artist: 'Oasis', userIds: ['user-1', 'user-2'] }]);
  });

  it('無いセッションは NOT_FOUND', async () => {
    const db = createDb();
    db.jamSession.findUnique.mockResolvedValue(null);

    await expect(
      callerFor(db).jamSession.sharedArtists({ sessionId: 'missing' }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('参加中のメンバーが 1 人以下なら My Best Songs を読まない', async () => {
    const db = createDb();
    db.jamSessionParticipant.findMany.mockResolvedValue([{ userId: 'user-1' }]);

    expect(await callerFor(db).jamSession.sharedArtists({ sessionId: 'session-1' })).toEqual([]);
    expect(db.myBestSong.findMany).not.toHaveBeenCalled();
  });
});
