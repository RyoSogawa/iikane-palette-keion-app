import sharp from 'sharp';
import { describe, expect, it, vi } from 'vitest';

import { EventImageStorageService } from './event-image-storage.service';

import type { SupabaseClient } from '@supabase/supabase-js';

const STORAGE = 'http://supabase.test/storage/v1/object/public';

const createPng = (width: number, height: number) =>
  sharp({ create: { width, height, channels: 4, background: '#33669980' } })
    .png()
    .toBuffer();

const createSupabaseMock = (options: { uploadError?: Error } = {}) => {
  const bucket = {
    remove: vi.fn().mockResolvedValue({ data: [], error: null }),
    upload: vi.fn((path: string) =>
      Promise.resolve(
        options.uploadError
          ? { data: null, error: options.uploadError }
          : { data: { path }, error: null },
      ),
    ),
  };
  const from = vi.fn(() => bucket);
  const supabase = { storage: { from } };
  return { supabase: supabase as unknown as SupabaseClient, bucket, from };
};

const uploadedBody = (bucket: ReturnType<typeof createSupabaseMock>['bucket']) =>
  (bucket.upload.mock.calls[0] as unknown as [string, Buffer])[1];

describe('EventImageStorageService.save', () => {
  it('イベント画像は幅 1200px 以内の WebP にして events/{eventId}/ に保存する', async () => {
    const { supabase, bucket, from } = createSupabaseMock();

    const url = await new EventImageStorageService(supabase).save(
      { kind: 'event', eventId: 'event-1' },
      await createPng(2400, 1600),
    );

    expect(from).toHaveBeenCalledWith('events');
    expect(url).toMatch(new RegExp(`^${STORAGE}/events/event-1/event-\\d+\\.webp$`));
    expect(await sharp(uploadedBody(bucket)).metadata()).toMatchObject({
      format: 'webp',
      width: 1200,
      height: 800,
    });
  });

  it('縦長のイベント画像は幅いっぱいに表示されるので、高さ 1800px まで残す', async () => {
    const { supabase, bucket } = createSupabaseMock();

    await new EventImageStorageService(supabase).save(
      { kind: 'event', eventId: 'event-1' },
      await createPng(1200, 2400),
    );

    expect(await sharp(uploadedBody(bucket)).metadata()).toMatchObject({
      width: 900,
      height: 1800,
    });
  });

  it('小さい画像は引き伸ばさない', async () => {
    const { supabase, bucket } = createSupabaseMock();

    await new EventImageStorageService(supabase).save(
      { kind: 'bandPhoto', eventId: 'event-1', bandId: 'band-1' },
      await createPng(600, 400),
    );

    expect(await sharp(uploadedBody(bucket)).metadata()).toMatchObject({ width: 600, height: 400 });
  });

  it('バンドのアイコン画像は 480x480 に切り抜く', async () => {
    const { supabase, bucket } = createSupabaseMock();

    const url = await new EventImageStorageService(supabase).save(
      { kind: 'bandImage', eventId: 'event-1', bandId: 'band-1' },
      await createPng(1200, 800),
    );

    expect(url).toMatch(/\/events\/event-1\/band-1-bandImage-\d+\.webp$/);
    expect(await sharp(uploadedBody(bucket)).metadata()).toMatchObject({ width: 480, height: 480 });
  });

  it.each([
    ['横長', [2000, 200], { width: 960, height: 96 }],
    ['正方形に近い', [1000, 1000], { width: 480, height: 480 }],
  ] as const)('%s のタイポ画像は 960x480 以内に縮める', async (_, [width, height], expected) => {
    const { supabase, bucket } = createSupabaseMock();

    await new EventImageStorageService(supabase).save(
      { kind: 'bandTypoImage', eventId: 'event-1', bandId: 'band-1' },
      await createPng(width, height),
    );

    expect(await sharp(uploadedBody(bucket)).metadata()).toMatchObject(expected);
  });

  it('タイポ画像は透過を残す', async () => {
    const { supabase, bucket } = createSupabaseMock();

    await new EventImageStorageService(supabase).save(
      { kind: 'bandTypoImage', eventId: 'event-1', bandId: 'band-1' },
      await createPng(1000, 200),
    );

    expect(await sharp(uploadedBody(bucket)).metadata()).toMatchObject({ hasAlpha: true });
  });

  it('アップロードに失敗したら投げる', async () => {
    const { supabase } = createSupabaseMock({ uploadError: new Error('denied') });

    await expect(
      new EventImageStorageService(supabase).save(
        { kind: 'event', eventId: 'event-1' },
        await createPng(10, 10),
      ),
    ).rejects.toThrow('denied');
  });
});

describe('EventImageStorageService.removeByUrl', () => {
  it('events バケットの URL ならそのファイルを消す', async () => {
    const { supabase, bucket } = createSupabaseMock();

    await new EventImageStorageService(supabase).removeByUrl(
      `${STORAGE}/events/event-1/event-123.webp`,
    );

    expect(bucket.remove).toHaveBeenCalledWith(['event-1/event-123.webp']);
  });

  it.each([
    null,
    'https://example.com/events/event-1/event-123.webp',
    `${STORAGE}/profiles/user-1/avatar1.webp`,
  ])('events バケット以外の URL（%s）は消さない', async (url) => {
    const { supabase, bucket } = createSupabaseMock();

    await new EventImageStorageService(supabase).removeByUrl(url);

    expect(bucket.remove).not.toHaveBeenCalled();
  });
});
