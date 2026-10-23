import sharp, { type ResizeOptions } from 'sharp';

import { STORAGE_PATH } from '@/constants/supabase';

import type { SupabaseClient } from '@supabase/supabase-js';

const BUCKET = 'events';
const BUCKET_URL_PREFIX = `${STORAGE_PATH}/${BUCKET}/`;

export type EventImageTarget =
  | { kind: 'event'; eventId: string }
  | { kind: 'bandPhoto' | 'bandImage' | 'bandTypoImage'; eventId: string; bandId: string };

export type EventImageKind = EventImageTarget['kind'];

// bandImage は公開ページで正方形のアイコンとして出すので切り抜く。それ以外は縦横比を保って縮めるだけ
const RESIZE_OPTIONS: Record<EventImageKind, ResizeOptions> = {
  event: { width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true },
  bandPhoto: { width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true },
  bandImage: { width: 400, height: 400, fit: 'cover' },
  bandTypoImage: { width: 800, height: 800, fit: 'inside', withoutEnlargement: true },
};

const fileNameOf = (target: EventImageTarget) =>
  target.kind === 'event' ? 'event' : `${target.bandId}-${target.kind}`;

/**
 * イベントとバンドの画像を Supabase Storage の events バケットに保存する。
 * events への書き込みは RLS で管理者に限られているので、createSupabaseClientForAdmin のクライアントを渡すこと。
 */
export class EventImageStorageService {
  constructor(private readonly supabase: SupabaseClient) {}

  /** 用途ごとの大きさの WebP に変換して保存し、公開 URL を返す */
  public async save(target: EventImageTarget, image: ArrayBuffer | Buffer): Promise<string> {
    const webp = await sharp(image)
      .rotate()
      .resize(RESIZE_OPTIONS[target.kind])
      .webp({ quality: 80 })
      .toBuffer();

    const { data, error } = await this.supabase.storage
      .from(BUCKET)
      .upload(`${target.eventId}/${fileNameOf(target)}-${Date.now()}.webp`, webp, {
        contentType: 'image/webp',
      });
    if (error) {
      throw error;
    }

    return `${BUCKET_URL_PREFIX}${data.path}`;
  }

  /**
   * 差し替え前の画像を消す。管理画面より前に登録された外部 URL の画像は、
   * このバケットのものではないので触らない。
   */
  public async removeByUrl(url: string | null): Promise<void> {
    if (!url?.startsWith(BUCKET_URL_PREFIX)) return;

    const { error } = await this.supabase.storage
      .from(BUCKET)
      .remove([url.slice(BUCKET_URL_PREFIX.length)]);
    if (error) {
      throw error;
    }
  }
}
