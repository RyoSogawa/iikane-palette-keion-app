import { beforeEach, describe, expect, it, vi } from 'vitest';

import { appRouter } from '@/server/api/root';
import { createCallerFactory } from '@/server/api/trpc';
import { EVENT_IMAGE_URL_PREFIX } from '@/server/applications/services/event-image-storage.service';

import type * as StorageService from '@/server/applications/services/event-image-storage.service';
import type { Session } from 'next-auth';

const mocks = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  removeByUrl: vi.fn(),
  removeEventFolder: vi.fn(),
}));

vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock('@/server/auth', () => ({ getServerAuthSession: vi.fn() }));
vi.mock('@/server/db', () => ({ db: {} }));
vi.mock('@/utils/supabase', () => ({ createSupabaseClientForAdmin: vi.fn(() => ({})) }));
vi.mock('@/server/applications/services/event-image-storage.service', async (importOriginal) => ({
  ...(await importOriginal<typeof StorageService>()),
  EventImageStorageService: class {
    removeByUrl = mocks.removeByUrl;
    removeEventFolder = mocks.removeEventFolder;
  },
}));

const IMAGE_URL = `${EVENT_IMAGE_URL_PREFIX}event-1/band-1-bandPhoto-1.webp`;

const createDb = () => {
  const db = {
    event: {
      create: vi.fn().mockResolvedValue({ id: 'event-1' }),
      update: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue({}),
      findUnique: vi.fn().mockResolvedValue({ image: IMAGE_URL }),
    },
    band: {
      aggregate: vi.fn().mockResolvedValue({ _max: { liveOrder: 3 } }),
      create: vi.fn().mockResolvedValue({ id: 'band-new' }),
      findMany: vi.fn().mockResolvedValue([{ id: 'band-1' }, { id: 'band-2' }]),
      update: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue({ photo: IMAGE_URL, image: null, typoImage: null }),
      findFirst: vi.fn().mockResolvedValue({ photo: IMAGE_URL, image: null, typoImage: null }),
    },
    userOnBand: {
      deleteMany: vi.fn().mockResolvedValue({}),
      createMany: vi.fn().mockResolvedValue({}),
    },
    $transaction: vi.fn((fn: (tx: unknown) => unknown) => fn(db)),
  };
  return db;
};

const sessionOf = (isAdmin: boolean): Session => ({
  expires: '2099-12-31T00:00:00.000Z',
  user: { id: 'user-1', isAdmin },
});

const callerFor = (db: ReturnType<typeof createDb>, isAdmin = true) =>
  createCallerFactory(appRouter)({
    db: db as never,
    session: sessionOf(isAdmin),
    headers: new Headers(),
  });

const eventInput = {
  name: 'いいかげんライブ',
  description: '',
  dateFrom: new Date('2026-11-01T10:00:00+09:00'),
  dateTo: new Date('2026-11-01T18:00:00+09:00'),
  movie: '',
  driveLink: '',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('admin ルーター', () => {
  // admin 配下に手続きを足したら自動で対象に入るよう、一覧はルーターから取る
  const adminPaths = Object.keys(appRouter._def.procedures).filter((path) =>
    path.startsWith('admin.'),
  );

  const callByPath = (caller: object, path: string) => {
    const procedure = path
      .split('.')
      .reduce<unknown>((node, key) => (node as Record<string, unknown>)[key], caller);
    return (procedure as (input?: unknown) => Promise<unknown>)();
  };

  // 認可は入力の検証より前に走るので、入力なしで呼んでも判定を確かめられる。
  // DB は空のオブジェクトなので、認可をすり抜けると FORBIDDEN 以外のエラーで落ちる
  const callerWith = (session: Session | null) =>
    createCallerFactory(appRouter)({ db: {} as never, session, headers: new Headers() });

  it('admin 配下の手続きを一覧として取れている', () => {
    expect(adminPaths).toContain('admin.event.getAll');
    expect(adminPaths).toContain('admin.band.setMembers');
  });

  it.each(adminPaths)('管理者でなければ %s は FORBIDDEN', async (path) => {
    await expect(callByPath(callerWith(sessionOf(false)), path)).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });

  it.each(adminPaths)('未ログインなら %s は UNAUTHORIZED', async (path) => {
    await expect(callByPath(callerWith(null), path)).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
    });
  });

  it('イベントは下書きで作成する', async () => {
    const db = createDb();

    await callerFor(db).admin.event.create(eventInput);

    expect(db.event.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ isDraft: true }) as unknown }),
    );
  });

  it('公開状態を変えたら公開ページのキャッシュを消す', async () => {
    const db = createDb();

    await callerFor(db).admin.event.setDraft({ id: 'event-1', isDraft: false });

    expect(db.event.update).toHaveBeenCalledWith({
      where: { id: 'event-1' },
      data: { isDraft: false },
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/events', 'layout');
  });

  it('バンドは出演順の最後に追加する', async () => {
    const db = createDb();

    await callerFor(db).admin.band.create({
      eventId: 'event-1',
      data: { name: '新バンド', description: '', movie: '' },
    });

    expect(db.band.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          name: '新バンド',
          description: null,
          movie: null,
          eventId: 'event-1',
          liveOrder: 4,
        },
      }),
    );
  });

  it('出演順を渡された並びで振り直す', async () => {
    const db = createDb();

    await callerFor(db).admin.band.reorder({ eventId: 'event-1', bandIds: ['band-2', 'band-1'] });

    expect(db.band.update).toHaveBeenCalledWith({
      where: { id: 'band-2' },
      data: { liveOrder: 1 },
    });
    expect(db.band.update).toHaveBeenCalledWith({
      where: { id: 'band-1' },
      data: { liveOrder: 2 },
    });
  });

  it('並び替え中にバンドが増減していたら CONFLICT で更新しない', async () => {
    const db = createDb();

    await expect(
      callerFor(db).admin.band.reorder({ eventId: 'event-1', bandIds: ['band-1'] }),
    ).rejects.toMatchObject({ code: 'CONFLICT' });
    expect(db.band.update).not.toHaveBeenCalled();
  });

  it('メンバーを渡された順番で置き換える', async () => {
    const db = createDb();

    await callerFor(db).admin.band.setMembers({
      bandId: 'band-1',
      members: [
        { userId: 'user-2', userName: '', part: 'Vo' },
        { userId: 'user-3', userName: 'ゲスト', part: '' },
      ],
    });

    expect(db.userOnBand.deleteMany).toHaveBeenCalledWith({ where: { bandId: 'band-1' } });
    expect(db.userOnBand.createMany).toHaveBeenCalledWith({
      data: [
        { userId: 'user-2', userName: null, part: 'Vo', bandId: 'band-1', order: 1 },
        { userId: 'user-3', userName: 'ゲスト', part: null, bandId: 'band-1', order: 2 },
      ],
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/events', 'layout');
  });

  it('イベントを削除したら、そのイベントの画像もまとめて消す', async () => {
    const db = createDb();

    await callerFor(db).admin.event.remove({ id: 'event-1' });

    expect(db.event.delete).toHaveBeenCalledWith({ where: { id: 'event-1' } });
    expect(mocks.removeEventFolder).toHaveBeenCalledWith('event-1');
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/events', 'layout');
  });

  it('画像の後片付けに失敗しても、イベントの削除は成功にする', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    mocks.removeEventFolder.mockRejectedValueOnce(new Error('storage down'));

    await expect(
      callerFor(createDb()).admin.event.remove({ id: 'event-1' }),
    ).resolves.toBeUndefined();
  });

  it('バンドを削除したら、そのバンドの画像も消す', async () => {
    const db = createDb();

    await callerFor(db).admin.band.remove({ id: 'band-1' });

    expect(mocks.removeByUrl.mock.calls).toEqual([[IMAGE_URL], [null], [null]]);
  });

  it('画像の URL を差し替え、差し替え前の URL を返す', async () => {
    const db = createDb();
    const newUrl = `${EVENT_IMAGE_URL_PREFIX}event-1/event-2.webp`;

    const previousUrl = await callerFor(db).admin.image.set({
      target: { kind: 'event', eventId: 'event-1' },
      url: newUrl,
    });

    expect(previousUrl).toBe(IMAGE_URL);
    expect(db.event.update).toHaveBeenCalledWith({
      where: { id: 'event-1' },
      data: { image: newUrl },
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/events', 'layout');
  });

  it('バンドの画像は、そのイベントのバンドであることを確かめてから差し替える', async () => {
    const db = createDb();
    db.band.findFirst.mockResolvedValueOnce(null);

    await expect(
      callerFor(db).admin.image.set({
        target: { kind: 'bandPhoto', eventId: 'event-1', bandId: 'other-band' },
        url: null,
      }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    expect(db.band.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'other-band', eventId: 'event-1' } }),
    );
    expect(db.band.update).not.toHaveBeenCalled();
  });

  it('events バケット以外の URL は画像として保存できない', async () => {
    await expect(
      callerFor(createDb()).admin.image.set({
        target: { kind: 'event', eventId: 'event-1' },
        url: 'https://example.com/evil.png',
      }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });
});
