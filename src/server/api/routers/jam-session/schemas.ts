import { z } from 'zod';

import { JamSessionPartSchema } from '@/types/generated/zod';

const blankToNull = (value: string) => {
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
};

const optionalText = (max: number) => z.string().max(max).transform(blankToNull);

const unique = <T>(values: T[]) => [...new Set(values)];

const PART_NOTE_REQUIRED = '「その他」の楽器名を入力してください';

const partsField = (min: number, message?: string) =>
  z
    .array(JamSessionPartSchema)
    .transform(unique)
    .pipe(z.array(JamSessionPartSchema).min(min, message));

const partNoteField = z.string().trim().max(30).optional().default('');

type PartSelection = { parts: string[]; partNote: string };

/** その他を選んだときだけ楽器名を必須にし、選んでいなければ楽器名は持たない */
const refinePartNote = <T extends PartSelection>(value: T, ctx: z.RefinementCtx) => {
  if (value.parts.includes('other') && value.partNote === '') {
    ctx.addIssue({ code: 'custom', message: PART_NOTE_REQUIRED, path: ['partNote'] });
  }
};

const normalizePartNote = <T extends PartSelection>(value: T) => ({
  ...value,
  partNote: value.parts.includes('other') ? value.partNote : null,
});

const rootsField = z
  .array(z.string().trim().max(20, 'ルーツは 20 文字までです'))
  .max(8, 'ルーツは 8 件までです')
  .transform((roots) => unique(roots.filter((root) => root !== '')));

/** 参加するとき、または参加中にプロフィールを直すときの入力 */
export const joinInputSchema = z
  .object({ parts: partsField(0), partNote: partNoteField, roots: rootsField })
  .superRefine(refinePartNote)
  .transform(normalizePartNote);

export type JoinInput = z.input<typeof joinInputSchema>;

/** ある曲の自分のパート一式。空にすれば取り下げになる */
export const setMyPartsInputSchema = z
  .object({ songId: z.string(), parts: partsField(0), partNote: partNoteField })
  .superRefine(refinePartNote)
  .transform(normalizePartNote);

/**
 * 曲を挙げる入力。Spotify の曲は spotifyId だけを使い、曲名とアーティスト名はサーバーが取り直す。
 * クライアントの曲名を信じると、偽の曲名で本物の spotifyId を先取りできてしまうため。
 */
export const createSongInputSchema = z
  .object({
    // getSeveralTracks はカンマ区切りで複数の曲を取るので、1 曲分の ID の形だけを通す
    spotifyId: z
      .string()
      .regex(/^([A-Za-z0-9]{22})?$/, 'Spotify の曲 ID が正しくありません')
      .optional()
      .default('')
      .transform(blankToNull),
    name: optionalText(100).optional().default(null),
    artist: optionalText(100).optional().default(null),
    parts: partsField(1, 'パートを 1 つ以上選んでください'),
    partNote: partNoteField,
  })
  .superRefine((value, ctx) => {
    refinePartNote(value, ctx);
    if (!value.spotifyId && !value.name && !value.artist) {
      ctx.addIssue({
        code: 'custom',
        message: '曲名かアーティスト名を入力してください',
        path: ['name'],
      });
    }
  })
  .transform((value) =>
    normalizePartNote(value.spotifyId ? { ...value, name: null, artist: null } : value),
  );

export type CreateSongInput = z.input<typeof createSongInputSchema>;

export const songIdInputSchema = z.object({ songId: z.string() });

export const setPlayedInputSchema = z.object({ songId: z.string(), played: z.boolean() });

/** userId を省けば自分が退出する */
export const leaveInputSchema = z.object({ userId: z.string().optional() }).optional();
