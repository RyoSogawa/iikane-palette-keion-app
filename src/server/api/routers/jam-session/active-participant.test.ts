import { describe, expect, it } from 'vitest';

import { activeSince, isActiveParticipant } from './active-participant';

const NOW = new Date('2026-11-11T12:00:00Z');

describe('参加中の判定', () => {
  it('参加から 24 時間たっていなければ参加中', () => {
    expect(isActiveParticipant(new Date('2026-11-10T12:00:01Z'), NOW)).toBe(true);
  });

  it('参加から 24 時間たったら退出扱い', () => {
    expect(isActiveParticipant(new Date('2026-11-10T12:00:00Z'), NOW)).toBe(false);
  });

  it('退出していれば参加中ではない', () => {
    expect(isActiveParticipant(null, NOW)).toBe(false);
    expect(isActiveParticipant(undefined, NOW)).toBe(false);
  });

  it('クエリの境界は 24 時間前', () => {
    expect(activeSince(NOW)).toEqual(new Date('2026-11-10T12:00:00Z'));
  });
});
