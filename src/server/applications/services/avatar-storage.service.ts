import sharp from 'sharp';

import { STORAGE_PATH } from '@/constants/supabase';

import type { SupabaseClient } from '@supabase/supabase-js';

const BUCKET = 'profiles';
const DISCORD_CDN_ORIGIN = 'https://cdn.discordapp.com';

export const isDiscordCdnUrl = (url: string | null | undefined): url is string => {
  if (!url) return false;
  try {
    return new URL(url).origin === DISCORD_CDN_ORIGIN;
  } catch {
    return false;
  }
};

/**
 * アバター画像を Supabase Storage の profiles バケットに保存する。
 * profiles への書き込みは RLS で authenticated ロールに限られているので、
 * 対象ユーザーとして署名した JWT を持つクライアントを渡すこと。
 */
export class AvatarStorageService {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly fetcher: typeof fetch = fetch,
  ) {}

  /** 600x600 の PNG に変換して保存し、公開 URL を返す。そのユーザーの古いアバターは消す */
  public async save(userId: string, image: ArrayBuffer | Buffer): Promise<string> {
    const bucket = this.supabase.storage.from(BUCKET);

    const { data: existing } = await bucket.list(userId, { search: 'avatar' });
    if (existing && existing.length > 0) {
      await bucket.remove(existing.map((file) => `${userId}/${file.name}`));
    }

    const png = await sharp(image)
      .png({
        quality: 90,
        compressionLevel: 9,
        adaptiveFiltering: true,
        progressive: true,
      })
      .resize({
        width: 600,
        height: 600,
        fit: 'cover',
      })
      .toBuffer();

    const { data, error } = await bucket.upload(`${userId}/avatar${Date.now()}.png`, png, {
      upsert: true,
      contentType: 'image/png',
    });
    if (error) {
      throw error;
    }

    return `${STORAGE_PATH}/${BUCKET}/${data.path}`;
  }

  /** Discord の CDN にあるアバター画像を取得して保存し、公開 URL を返す */
  public async copyFromDiscord(userId: string, imageUrl: string): Promise<string> {
    // ユーザーのプロフィール由来の URL を取りに行くので、Discord の CDN 以外は取得しない
    if (!isDiscordCdnUrl(imageUrl)) {
      throw new Error('Discord の CDN 以外の URL は取得しません');
    }

    const res = await this.fetcher(imageUrl);
    if (!res.ok) {
      throw new Error(`Discord のアバター画像を取得できませんでした: ${res.status} ${imageUrl}`);
    }

    return this.save(userId, await res.arrayBuffer());
  }
}
