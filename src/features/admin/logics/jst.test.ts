import { describe, expect, it } from 'vitest';

import { formatJst, fromDateTimeLocal, toDateTimeLocal } from './jst';

describe('toDateTimeLocal', () => {
  it('実行環境のタイムゾーンによらず JST の yyyy-MM-ddTHH:mm にする', () => {
    expect(toDateTimeLocal(new Date('2026-11-01T00:05:00Z'))).toBe('2026-11-01T09:05');
    expect(toDateTimeLocal(new Date('2026-10-31T16:00:00Z'))).toBe('2026-11-01T01:00');
  });
});

describe('fromDateTimeLocal', () => {
  it('JST として Date に戻す', () => {
    expect(fromDateTimeLocal('2026-11-01T09:05')).toEqual(new Date('2026-11-01T00:05:00Z'));
  });

  it('秒まで入っていても受け付ける', () => {
    expect(fromDateTimeLocal('2026-11-01T09:05:30')).toEqual(new Date('2026-11-01T00:05:30Z'));
  });

  it('空や不正な値は null', () => {
    expect(fromDateTimeLocal('')).toBeNull();
    expect(fromDateTimeLocal('abc')).toBeNull();
    expect(fromDateTimeLocal('2026-13-40T99:99')).toBeNull();
  });
});

describe('formatJst', () => {
  it('JST の yyyy/MM/dd HH:mm で表示する', () => {
    expect(formatJst(new Date('2026-10-31T16:00:00Z'))).toBe('2026/11/01 01:00');
  });
});
