import { describe, expect, it } from 'vitest';

import { sortSessions } from './session-list';

const session = (id: string, heldOn: string) => ({ id, heldOn: new Date(`${heldOn}T00:00:00Z`) });

describe('sortSessions', () => {
  it('今日のセッションを一番上にし、それ以外は日付の新しい順に並べる', () => {
    const sessions = [
      session('future', '2026-12-01'),
      session('past', '2026-10-01'),
      session('today', '2026-11-11'),
      session('recent', '2026-11-01'),
    ];

    expect(sortSessions(sessions, '2026-11-11').map(({ id }) => id)).toEqual([
      'today',
      'future',
      'recent',
      'past',
    ]);
  });

  it('同じ日のセッションは元の順のまま並べ、元の配列は変えない', () => {
    const sessions = [session('a', '2026-11-11'), session('b', '2026-11-11')];

    expect(sortSessions(sessions, '2026-11-11').map(({ id }) => id)).toEqual(['a', 'b']);
    expect(sessions.map(({ id }) => id)).toEqual(['a', 'b']);
  });
});
