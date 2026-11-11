import { describe, expect, it } from 'vitest';

import {
  JAM_SESSION_PARTS,
  PRESENCE_ALWAYS_SHOWN_PARTS,
  SONG_RECRUITING_PARTS,
  partLabel,
  sortParts,
} from './parts';

describe('パートの定義', () => {
  it('Vo / Gt / Ba / Dr / Key / 管楽器 / 弦楽器 / Perc / その他 の順に並ぶ', () => {
    expect(JAM_SESSION_PARTS.map(({ label }) => label)).toEqual([
      'Vo',
      'Gt',
      'Ba',
      'Dr',
      'Key',
      '管楽器',
      '弦楽器',
      'Perc',
      'その他',
    ]);
  });

  it('その他は楽器名があればそれを表示名にする', () => {
    expect(partLabel('other', 'ハーモニカ')).toBe('ハーモニカ');
    expect(partLabel('other', null)).toBe('その他');
    expect(partLabel('guitar', 'ハーモニカ')).toBe('Gt');
  });

  it('曲で募集を出すのは Vo / Gt / Ba / Dr、いまいる人では Key も出す', () => {
    expect(SONG_RECRUITING_PARTS).toEqual(['vocal', 'guitar', 'bass', 'drums']);
    expect(PRESENCE_ALWAYS_SHOWN_PARTS).toEqual(['vocal', 'guitar', 'bass', 'drums', 'keyboard']);
  });

  it('パートを定義の順に並べ替え、元の配列は変えない', () => {
    const parts = ['other', 'vocal', 'drums'] as const;
    expect(sortParts(parts)).toEqual(['vocal', 'drums', 'other']);
    expect(parts).toEqual(['other', 'vocal', 'drums']);
  });
});
