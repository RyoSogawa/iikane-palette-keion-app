import { describe, expect, it } from 'vitest';

import { bandInputSchema, eventInputSchema, membersInputSchema } from './schemas';

const validEvent = {
  name: 'いいかげんライブ',
  description: '',
  dateFrom: new Date('2026-11-01T10:00:00+09:00'),
  dateTo: new Date('2026-11-01T18:00:00+09:00'),
  movie: '',
  driveLink: '',
};

describe('eventInputSchema', () => {
  it('空文字の任意項目は null にする', () => {
    expect(eventInputSchema.parse(validEvent)).toMatchObject({
      description: null,
      movie: null,
      driveLink: null,
    });
  });

  it('名前が空なら弾く', () => {
    expect(eventInputSchema.safeParse({ ...validEvent, name: ' ' }).success).toBe(false);
  });

  it('終了日時が開始日時より前なら弾く', () => {
    const result = eventInputSchema.safeParse({
      ...validEvent,
      dateTo: new Date('2026-11-01T09:00:00+09:00'),
    });
    expect(result.success).toBe(false);
  });

  it.each(['javascript:alert(1)', 'http://example.com/movie', 'not a url'])(
    'https 以外の動画 URL（%s）は弾く',
    (movie) => {
      expect(eventInputSchema.safeParse({ ...validEvent, movie }).success).toBe(false);
    },
  );

  it('https の URL は通す', () => {
    const movie = 'https://www.youtube.com/embed/abc';
    expect(eventInputSchema.parse({ ...validEvent, movie }).movie).toBe(movie);
  });
});

describe('bandInputSchema', () => {
  it('名前が必須', () => {
    expect(bandInputSchema.safeParse({ name: '', description: '', movie: '' }).success).toBe(false);
  });
});

describe('membersInputSchema', () => {
  it('同じユーザーを 2 回入れたら、2 回目の行のユーザー欄のエラーにする', () => {
    const result = membersInputSchema.safeParse([
      { userId: 'user-1', userName: '', part: 'Vo' },
      { userId: 'user-2', userName: '', part: 'Ba' },
      { userId: 'user-1', userName: '', part: 'Gt' },
    ]);
    expect(result.error?.issues).toEqual([
      expect.objectContaining({ path: [2, 'userId'], message: 'ほかの行と同じユーザーです' }),
    ]);
  });

  it('ユーザーを選んでいない行は、その行のユーザー欄のエラーにする', () => {
    const result = membersInputSchema.safeParse([{ userId: '', userName: '', part: '' }]);
    expect(result.error?.issues).toEqual([
      expect.objectContaining({ path: [0, 'userId'], message: 'ユーザーを選んでください' }),
    ]);
  });

  it('表示名とパートの空文字は null にする', () => {
    expect(membersInputSchema.parse([{ userId: 'user-1', userName: ' ', part: '' }])).toEqual([
      { userId: 'user-1', userName: null, part: null },
    ]);
  });
});
