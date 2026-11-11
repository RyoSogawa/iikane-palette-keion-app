import { describe, expect, it } from 'vitest';

import { memberCount, sortSongs, summarizeParts } from './song-list';

import type { JamSessionPartType } from '@/types/generated/zod';

const entry = (userId: string, part: JamSessionPartType, partNote: string | null = null) => ({
  userId,
  part,
  partNote,
});

const song = (
  id: string,
  createdAt: string,
  entries: ReturnType<typeof entry>[],
  playedAt: string | null = null,
) => ({
  id,
  createdAt: new Date(createdAt),
  playedAt: playedAt ? new Date(playedAt) : null,
  entries,
});

describe('memberCount', () => {
  it('同じ人が複数パートで手を挙げていても 1 人と数える', () => {
    expect(memberCount([entry('a', 'vocal'), entry('a', 'guitar'), entry('b', 'bass')])).toBe(2);
  });
});

describe('sortSongs', () => {
  it('手を挙げている人数の多い順に並べる', () => {
    const one = song('one', '2026-11-11T10:00:00Z', [entry('a', 'vocal')]);
    const three = song('three', '2026-11-11T09:00:00Z', [
      entry('a', 'vocal'),
      entry('b', 'guitar'),
      entry('c', 'drums'),
    ]);

    expect(sortSongs([one, three]).map(({ id }) => id)).toEqual(['three', 'one']);
  });

  it('人数が同じなら新しく挙がった曲を上にする', () => {
    const older = song('older', '2026-11-11T09:00:00Z', [entry('a', 'vocal')]);
    const newer = song('newer', '2026-11-11T10:00:00Z', [entry('b', 'vocal')]);

    expect(sortSongs([older, newer]).map(({ id }) => id)).toEqual(['newer', 'older']);
  });

  it('演奏済みの曲は、人数が多くても未演奏の曲より下にする', () => {
    const played = song(
      'played',
      '2026-11-11T10:00:00Z',
      [entry('a', 'vocal'), entry('b', 'guitar')],
      '2026-11-11T11:00:00Z',
    );
    const empty = song('empty', '2026-11-11T09:00:00Z', []);

    expect(sortSongs([played, empty]).map(({ id }) => id)).toEqual(['empty', 'played']);
  });

  it('元の配列は変えない', () => {
    const songs = [
      song('a', '2026-11-11T09:00:00Z', []),
      song('b', '2026-11-11T10:00:00Z', [entry('x', 'vocal')]),
    ];
    sortSongs(songs);
    expect(songs.map(({ id }) => id)).toEqual(['a', 'b']);
  });
});

describe('summarizeParts', () => {
  it('Vo / Gt / Ba / Dr は誰もいなくても募集として出す', () => {
    expect(summarizeParts([])).toEqual([
      { key: 'vocal', part: 'vocal', label: 'Vo', userIds: [] },
      { key: 'guitar', part: 'guitar', label: 'Gt', userIds: [] },
      { key: 'bass', part: 'bass', label: 'Ba', userIds: [] },
      { key: 'drums', part: 'drums', label: 'Dr', userIds: [] },
    ]);
  });

  it('それ以外のパートは手を挙げた人がいるときだけ、定義の順に出す', () => {
    const summary = summarizeParts([
      entry('a', 'percussion'),
      entry('b', 'keyboard'),
      entry('c', 'guitar'),
      entry('d', 'guitar'),
    ]);

    expect(summary.map(({ label, userIds }) => [label, userIds])).toEqual([
      ['Vo', []],
      ['Gt', ['c', 'd']],
      ['Ba', []],
      ['Dr', []],
      ['Key', ['b']],
      ['Perc', ['a']],
    ]);
  });

  it('その他は楽器名ごとに分けて、楽器名を表示名にする', () => {
    const summary = summarizeParts([
      entry('a', 'other', 'ハーモニカ'),
      entry('b', 'other', 'タンバリン'),
      entry('c', 'other', 'ハーモニカ'),
    ]);

    expect(summary.slice(4)).toEqual([
      { key: 'other:ハーモニカ', part: 'other', label: 'ハーモニカ', userIds: ['a', 'c'] },
      { key: 'other:タンバリン', part: 'other', label: 'タンバリン', userIds: ['b'] },
    ]);
  });
});
