import { describe, expect, it } from 'vitest';

import {
  createSongInputSchema,
  joinInputSchema,
  sessionInputSchema,
  setMyPartsInputSchema,
} from './schemas';

describe('joinInputSchema', () => {
  it('パートの重複を除き、ルーツは前後の空白を除いて重複を除く', () => {
    expect(
      joinInputSchema.parse({
        parts: ['guitar', 'guitar', 'vocal'],
        partNote: '',
        roots: [' ロック ', 'ロック', 'UK ロック'],
      }),
    ).toEqual({ parts: ['guitar', 'vocal'], partNote: null, roots: ['ロック', 'UK ロック'] });
  });

  it('できるパートが 1 つも無ければ通さない', () => {
    const result = joinInputSchema.safeParse({ parts: [], partNote: '', roots: [] });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['parts']);
  });

  it('20 文字を超えるルーツは通さない', () => {
    expect(
      joinInputSchema.safeParse({ parts: ['vocal'], partNote: '', roots: ['あ'.repeat(21)] })
        .success,
    ).toBe(false);
    expect(
      joinInputSchema.safeParse({ parts: ['vocal'], partNote: '', roots: ['あ'.repeat(20)] })
        .success,
    ).toBe(true);
  });

  it('8 件を超えるルーツは通さない', () => {
    const roots = Array.from({ length: 9 }, (_, i) => `root${i}`);
    expect(joinInputSchema.safeParse({ parts: ['vocal'], partNote: '', roots }).success).toBe(
      false,
    );
    expect(
      joinInputSchema.safeParse({ parts: ['vocal'], partNote: '', roots: roots.slice(1) }).success,
    ).toBe(true);
  });

  it('空のルーツは捨てる', () => {
    expect(joinInputSchema.parse({ parts: ['vocal'], partNote: '', roots: ['  '] }).roots).toEqual(
      [],
    );
  });
});

describe('その他のパートの楽器名', () => {
  it('その他を選んだら楽器名が必須', () => {
    const result = setMyPartsInputSchema.safeParse({
      songId: 's',
      parts: ['other'],
      partNote: ' ',
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['partNote']);
  });

  it('楽器名は 30 文字まで', () => {
    const input = { songId: 's', parts: ['other'] };
    expect(setMyPartsInputSchema.safeParse({ ...input, partNote: 'あ'.repeat(31) }).success).toBe(
      false,
    );
    expect(setMyPartsInputSchema.safeParse({ ...input, partNote: 'あ'.repeat(30) }).success).toBe(
      true,
    );
  });

  it('その他を選んでいなければ楽器名は捨てる', () => {
    expect(
      setMyPartsInputSchema.parse({ songId: 's', parts: ['vocal'], partNote: 'ハーモニカ' })
        .partNote,
    ).toBeNull();
  });

  it('パートを空にすれば取り下げになる', () => {
    expect(setMyPartsInputSchema.parse({ songId: 's', parts: [], partNote: '' }).parts).toEqual([]);
  });
});

describe('createSongInputSchema', () => {
  const parts = { parts: ['vocal'], partNote: '' };

  it('アーティスト名だけでも挙げられる', () => {
    expect(createSongInputSchema.parse({ ...parts, name: '', artist: ' Oasis ' })).toMatchObject({
      spotifyId: null,
      name: null,
      artist: 'Oasis',
    });
  });

  it('曲名とアーティスト名の両方が空なら通さない', () => {
    const result = createSongInputSchema.safeParse({ ...parts, name: ' ', artist: '' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('曲名かアーティスト名を入力してください');
  });

  it('Spotify の曲は spotifyId だけでよく、送られた曲名とアーティスト名は捨てる', () => {
    expect(
      createSongInputSchema.parse({
        ...parts,
        spotifyId: '4gzpq5DPGxSnKTe4SA8HAU',
        name: '偽の曲名',
        artist: '',
      }),
    ).toMatchObject({ spotifyId: '4gzpq5DPGxSnKTe4SA8HAU', name: null, artist: null });
  });

  it.each(['4gzpq5DPGxSnKTe4SA8HAU,0000000000000000000000', 'short', '4gzpq5DPGxSnKTe4SA8HA!'])(
    '1 曲分の形でない spotifyId（%s）は通さない',
    (spotifyId) => {
      expect(createSongInputSchema.safeParse({ ...parts, spotifyId }).success).toBe(false);
    },
  );

  it('パートを 1 つも選ばなければ通さない', () => {
    const result = createSongInputSchema.safeParse({ parts: [], partNote: '', artist: 'Oasis' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['parts']);
  });

  it('曲名とアーティスト名は 100 文字まで', () => {
    expect(createSongInputSchema.safeParse({ ...parts, name: 'あ'.repeat(101) }).success).toBe(
      false,
    );
    expect(createSongInputSchema.safeParse({ ...parts, artist: 'あ'.repeat(100) }).success).toBe(
      true,
    );
  });
});

describe('sessionInputSchema', () => {
  it('名前は前後の空白を除き、日付は date 型にする', () => {
    expect(sessionInputSchema.parse({ name: ' 11 月のセッション ', heldOn: '2026-11-11' })).toEqual(
      {
        name: '11 月のセッション',
        heldOn: new Date('2026-11-11T00:00:00.000Z'),
      },
    );
  });

  it('名前は必須で 50 文字まで', () => {
    expect(sessionInputSchema.safeParse({ name: ' ', heldOn: '2026-11-11' }).success).toBe(false);
    expect(
      sessionInputSchema.safeParse({ name: 'あ'.repeat(51), heldOn: '2026-11-11' }).success,
    ).toBe(false);
    expect(
      sessionInputSchema.safeParse({ name: 'あ'.repeat(50), heldOn: '2026-11-11' }).success,
    ).toBe(true);
  });

  it.each(['', '2026/11/11', '2026-13-40', '2026-02-30'])(
    '正しくない日付（%s）は通さない',
    (heldOn) => {
      expect(sessionInputSchema.safeParse({ name: 'セッション', heldOn }).success).toBe(false);
    },
  );
});
