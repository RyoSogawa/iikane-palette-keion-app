import sharp, { type ResizeOptions, type WebpOptions } from 'sharp';

import { STORAGE_PATH } from '@/constants/supabase';

import type { SupabaseClient } from '@supabase/supabase-js';

const BUCKET = 'events';
/** events バケットの画像の公開 URL の先頭。DB に保存する画像の URL はこれで始まる */
export const EVENT_IMAGE_URL_PREFIX = `${STORAGE_PATH}/${BUCKET}/`;

// 1 イベントの画像はイベント 1 枚とバンドごとに 3 枚なので、この件数で足りる
const FOLDER_LIST_LIMIT = 1000;

export type EventImageTarget =
  | { kind: 'event'; eventId: string }
  | { kind: 'bandPhoto' | 'bandImage' | 'bandTypoImage'; eventId: string; bandId: string };

export type EventImageKind = EventImageTarget['kind'];

type ImageFormat = { resize: ResizeOptions; webp: WebpOptions };

// 寸法は公開ページでの最大の表示幅から決める。本文の幅は最大 928px（Container md 960px から余白を引いた値）で、
// スマホは幅 430px 前後を 3 倍の解像度で描くので、全幅の写真は幅 1200px あれば足りる。
// 写真は画質を少し落としても目立たないが、タイポ画像は文字の輪郭が崩れやすいので画質を上げ、色のにじみも抑える。
const PHOTO: ImageFormat = {
  // 縦長のフライヤーも幅いっぱいに出すので、高さは幅より大きく残す
  resize: { width: 1200, height: 1800, fit: 'inside', withoutEnlargement: true },
  webp: { quality: 75, effort: 6 },
};

const IMAGE_FORMATS: Record<EventImageKind, ImageFormat> = {
  event: PHOTO,
  bandPhoto: PHOTO,
  // バンド一覧の正方形のアイコン。一番大きく出るのはタブレット幅の 3 列表示で約 232px、2 倍で約 464px
  bandImage: {
    resize: { width: 480, height: 480, fit: 'cover' },
    webp: { quality: 80, effort: 6 },
  },
  // バンド一覧ではアイコンと同じ幅（2 倍で約 464px）、バンドページでは高さ 50px（3 倍で 150px）の横長で出る
  bandTypoImage: {
    resize: { width: 960, height: 480, fit: 'inside', withoutEnlargement: true },
    webp: { quality: 85, effort: 6, smartSubsample: true },
  },
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
    const format = IMAGE_FORMATS[target.kind];
    const webp = await sharp(image).rotate().resize(format.resize).webp(format.webp).toBuffer();

    const { data, error } = await this.supabase.storage
      .from(BUCKET)
      .upload(`${target.eventId}/${fileNameOf(target)}-${Date.now()}.webp`, webp, {
        contentType: 'image/webp',
      });
    if (error) {
      throw error;
    }

    return `${EVENT_IMAGE_URL_PREFIX}${data.path}`;
  }

  /**
   * 差し替え前の画像を消す。管理画面より前に登録された外部 URL の画像は、
   * このバケットのものではないので触らない。
   */
  public async removeByUrl(url: string | null): Promise<void> {
    if (!url?.startsWith(EVENT_IMAGE_URL_PREFIX)) return;

    const { error } = await this.supabase.storage
      .from(BUCKET)
      .remove([url.slice(EVENT_IMAGE_URL_PREFIX.length)]);
    if (error) {
      throw error;
    }
  }

  /** イベントを削除したときに、そのイベントの画像をまとめて消す。差し替えで消し損ねたファイルも残さない */
  public async removeEventFolder(eventId: string): Promise<void> {
    const { data, error } = await this.supabase.storage
      .from(BUCKET)
      .list(eventId, { limit: FOLDER_LIST_LIMIT });
    if (error) {
      throw error;
    }
    if (data.length === 0) return;

    const { error: removeError } = await this.supabase.storage
      .from(BUCKET)
      .remove(data.map((file) => `${eventId}/${file.name}`));
    if (removeError) {
      throw removeError;
    }
  }
}

/** 画像の後片付けに失敗しても、本体の処理は失敗にしない。使われないファイルが残るだけなので */
export const runCleanupQuietly = async (cleanup: () => Promise<unknown>) => {
  try {
    await cleanup();
  } catch (error) {
    console.error('Failed to clean up event images:', error);
  }
};
