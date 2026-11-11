import { describe, expect, it } from 'vitest';

import { groupByPart, groupByRoots } from './presence-groups';

import type { JamSessionPartType } from '@/types/generated/zod';

const person = (
  userId: string,
  parts: JamSessionPartType[],
  roots: string[] = [],
  partNote: string | null = null,
) => ({ userId, parts, roots, partNote });

describe('groupByPart', () => {
  it('Vo / Gt / Ba / Dr / Key は誰もいなくても出す', () => {
    expect(groupByPart([]).map(({ label, members }) => [label, members.length])).toEqual([
      ['Vo', 0],
      ['Gt', 0],
      ['Ba', 0],
      ['Dr', 0],
      ['Key', 0],
    ]);
  });

  it('複数のパートを持つ人は、それぞれのグループに出る', () => {
    const ken = person('ken', ['guitar', 'vocal']);
    const groups = groupByPart([ken]);

    expect(groups.find(({ label }) => label === 'Vo')?.members).toEqual([ken]);
    expect(groups.find(({ label }) => label === 'Gt')?.members).toEqual([ken]);
  });

  it('それ以外のパートはいるときだけ出し、その他は楽器名で出す', () => {
    const groups = groupByPart([
      person('nao', ['other'], [], 'ハーモニカ'),
      person('aki', ['wind']),
    ]);

    expect(groups.map(({ label }) => label)).toEqual([
      'Vo',
      'Gt',
      'Ba',
      'Dr',
      'Key',
      '管楽器',
      'ハーモニカ',
    ]);
  });
});

describe('groupByRoots', () => {
  it('1 人以上いるルーツだけを、選択肢の順、自由入力は出てきた順に出す', () => {
    const groups = groupByRoots([
      person('a', [], ['UK ロック', 'ジャズ']),
      person('b', [], ['ロック', 'ブルース', 'ジャズ']),
    ]);

    expect(
      groups.map(({ label, members }) => [label, members.map(({ userId }) => userId)]),
    ).toEqual([
      ['ロック', ['b']],
      ['ジャズ', ['a', 'b']],
      ['UK ロック', ['a']],
      ['ブルース', ['b']],
    ]);
  });

  it('誰もいなければ空', () => {
    expect(groupByRoots([])).toEqual([]);
  });
});
