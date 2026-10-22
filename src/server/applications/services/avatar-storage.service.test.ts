import sharp from 'sharp';
import { describe, expect, it, vi } from 'vitest';

import { AvatarStorageService, isDiscordCdnUrl } from './avatar-storage.service';

import type { SupabaseClient } from '@supabase/supabase-js';

const createPng = (width: number, height: number) =>
  sharp({ create: { width, height, channels: 3, background: '#336699' } })
    .png()
    .toBuffer();

const createSupabaseMock = (options: { existing?: string[]; uploadError?: Error } = {}) => {
  const bucket = {
    list: vi.fn().mockResolvedValue({
      data: (options.existing ?? []).map((name) => ({ name })),
      error: null,
    }),
    remove: vi.fn().mockResolvedValue({ data: [], error: null }),
    upload: vi.fn((path: string) =>
      Promise.resolve(
        options.uploadError
          ? { data: null, error: options.uploadError }
          : { data: { path }, error: null },
      ),
    ),
  };
  const supabase = { storage: { from: vi.fn(() => bucket) } };
  return { supabase: supabase as unknown as SupabaseClient, bucket };
};

describe('AvatarStorageService.save', () => {
  it('画像を 600x600 の PNG にして profiles/{userId}/ に保存し、公開 URL を返す', async () => {
    const { supabase, bucket } = createSupabaseMock();
    const service = new AvatarStorageService(supabase);

    const url = await service.save('user-1', await createPng(1200, 800));

    expect(url).toMatch(
      /^http:\/\/supabase\.test\/storage\/v1\/object\/public\/profiles\/user-1\/avatar\d+\.png$/,
    );
    const [path, body, options] = bucket.upload.mock.calls[0] as unknown as [
      string,
      Buffer,
      { contentType: string },
    ];
    expect(path).toMatch(/^user-1\/avatar\d+\.png$/);
    expect(options.contentType).toBe('image/png');
    const metadata = await sharp(body).metadata();
    expect(metadata).toMatchObject({ format: 'png', width: 600, height: 600 });
  });

  it('保存する前に、そのユーザーの古いアバター画像を消す', async () => {
    const { supabase, bucket } = createSupabaseMock({ existing: ['avatar1.png', 'avatar2.png'] });
    const service = new AvatarStorageService(supabase);

    await service.save('user-1', await createPng(10, 10));

    expect(bucket.list).toHaveBeenCalledWith('user-1', { search: 'avatar' });
    expect(bucket.remove).toHaveBeenCalledWith(['user-1/avatar1.png', 'user-1/avatar2.png']);
  });

  it('アップロードに失敗したらエラーを投げる', async () => {
    const uploadError = new Error('new row violates row-level security policy');
    const { supabase } = createSupabaseMock({ uploadError });
    const service = new AvatarStorageService(supabase);

    await expect(service.save('user-1', await createPng(10, 10))).rejects.toBe(uploadError);
  });
});

describe('AvatarStorageService.copyFromDiscord', () => {
  it('Discord の CDN から画像を取得して Supabase に保存する', async () => {
    const { supabase, bucket } = createSupabaseMock();
    const image = await createPng(128, 128);
    const fetcher = vi.fn().mockResolvedValue(new Response(new Uint8Array(image)));
    const service = new AvatarStorageService(supabase, fetcher);

    const url = await service.copyFromDiscord(
      'user-1',
      'https://cdn.discordapp.com/avatars/123/abc.png',
    );

    expect(fetcher).toHaveBeenCalledWith('https://cdn.discordapp.com/avatars/123/abc.png');
    expect(bucket.upload).toHaveBeenCalledOnce();
    expect(url).toContain('/profiles/user-1/avatar');
  });

  it('Discord の CDN 以外の URL は取得しない', async () => {
    const { supabase } = createSupabaseMock();
    const fetcher = vi.fn();
    const service = new AvatarStorageService(supabase, fetcher);

    await expect(
      service.copyFromDiscord('user-1', 'http://169.254.169.254/latest/meta-data'),
    ).rejects.toThrow('Discord の CDN 以外');
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('画像の取得に失敗したらエラーを投げ、保存しない', async () => {
    const { supabase, bucket } = createSupabaseMock();
    const fetcher = vi.fn().mockResolvedValue(new Response('not found', { status: 404 }));
    const service = new AvatarStorageService(supabase, fetcher);

    await expect(
      service.copyFromDiscord('user-1', 'https://cdn.discordapp.com/avatars/123/abc.png'),
    ).rejects.toThrow('404');
    expect(bucket.upload).not.toHaveBeenCalled();
  });
});

describe('isDiscordCdnUrl', () => {
  it.each([
    ['https://cdn.discordapp.com/avatars/123/abc.png', true],
    ['https://cdn.discordapp.com/embed/avatars/0.png', true],
    ['http://cdn.discordapp.com/avatars/123/abc.png', false],
    ['https://cdn.discordapp.com.evil.example/avatars/123/abc.png', false],
    ['http://supabase.test/storage/v1/object/public/profiles/user-1/avatar1.png', false],
    ['not a url', false],
    [null, false],
  ])('%s は %s', (url, expected) => {
    expect(isDiscordCdnUrl(url)).toBe(expected);
  });
});
