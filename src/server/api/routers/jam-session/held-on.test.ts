import { describe, expect, it } from 'vitest';

import { formatHeldOn, fromHeldOn, todayInJst, toHeldOn } from './held-on';

describe('セッションの日付', () => {
  it('YYYY-MM-DD を UTC の 0 時の Date にし、元に戻せる', () => {
    const date = toHeldOn('2026-11-11');
    expect(date.toISOString()).toBe('2026-11-11T00:00:00.000Z');
    expect(fromHeldOn(date)).toBe('2026-11-11');
  });

  it('今日の日付は JST で決める', () => {
    expect(todayInJst(new Date('2026-11-10T15:00:00Z'))).toBe('2026-11-11');
    expect(todayInJst(new Date('2026-11-10T14:59:59Z'))).toBe('2026-11-10');
  });

  it('画面には曜日つきで出す', () => {
    expect(formatHeldOn(toHeldOn('2026-11-11'))).toBe('2026/11/11（水）');
  });
});
