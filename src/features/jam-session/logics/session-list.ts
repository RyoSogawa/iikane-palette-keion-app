import { fromHeldOn } from '@/server/api/routers/jam-session/held-on';

/** セッションの一覧の並び。当日に開いてすぐ選べるよう今日のセッションを先頭にし、それ以外は日付の新しい順 */
export const sortSessions = <T extends { heldOn: Date }>(
  sessions: readonly T[],
  today: string,
): T[] =>
  [...sessions].sort(
    (a, b) =>
      Number(fromHeldOn(b.heldOn) === today) - Number(fromHeldOn(a.heldOn) === today) ||
      b.heldOn.getTime() - a.heldOn.getTime(),
  );
