const ACTIVE_DURATION_MS = 24 * 60 * 60 * 1000;

/**
 * 参加中とみなす joinedAt の下限。退出を忘れた人が次のセッションまで残らないよう、参加から 24 時間で切る。
 * 定期実行で joinedAt を消すのではなく、読むたびにこの境界で絞る。
 */
export const activeSince = (now: Date) => new Date(now.getTime() - ACTIVE_DURATION_MS);

export const isActiveParticipant = (joinedAt: Date | null | undefined, now: Date) =>
  joinedAt != null && joinedAt > activeSince(now);
