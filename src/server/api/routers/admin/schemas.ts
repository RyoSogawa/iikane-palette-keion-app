import { z } from 'zod';

const blankToNull = (value: string) => {
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
};

const optionalText = (max: number) => z.string().max(max).transform(blankToNull);

// 動画 URL は iframe の src にそのまま入るので、javascript: などを通さないよう https に限る
const optionalHttpsUrl = z
  .string()
  .trim()
  .refine((value) => {
    if (value === '') return true;
    try {
      return new URL(value).protocol === 'https:';
    } catch {
      return false;
    }
  }, 'https:// から始まる URL を入力してください')
  .transform(blankToNull);

/** 管理画面で編集するイベントの基本情報。画像はアップロード用の Server Action で別に扱う */
export const eventInputSchema = z
  .object({
    name: z.string().trim().min(1, '名前を入力してください').max(100),
    description: optionalText(5000),
    dateFrom: z.date(),
    dateTo: z.date(),
    movie: optionalHttpsUrl,
    driveLink: optionalHttpsUrl,
  })
  .refine(({ dateFrom, dateTo }) => dateFrom <= dateTo, {
    message: '終了日時は開始日時より後にしてください',
    path: ['dateTo'],
  });

export type EventInput = z.input<typeof eventInputSchema>;

/** 管理画面で編集するバンドの情報。画像はアップロード用の Server Action で別に扱う */
export const bandInputSchema = z.object({
  name: z.string().trim().min(1, '名前を入力してください').max(100),
  description: optionalText(5000),
  movie: optionalHttpsUrl,
});

export type BandInput = z.input<typeof bandInputSchema>;

/** バンドメンバーの一覧。配列の順番がそのまま表示順になる */
export const membersInputSchema = z
  .array(
    z.object({
      userId: z.string().min(1),
      userName: optionalText(50),
      part: optionalText(50),
    }),
  )
  .max(50)
  .refine((members) => new Set(members.map((m) => m.userId)).size === members.length, {
    message: '同じメンバーが重複しています',
  });

export type MembersInput = z.input<typeof membersInputSchema>;
