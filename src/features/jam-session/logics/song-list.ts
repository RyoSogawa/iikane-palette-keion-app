import { type JamSessionPartType } from '@/types/generated/zod';

import { partLabel, partOrder, SONG_RECRUITING_PARTS } from './parts';

type Entry = { userId: string; part: JamSessionPartType; partNote: string | null };

type SortableSong = { createdAt: Date; playedAt: Date | null; entries: readonly Entry[] };

export type PartSummary = {
  key: string;
  part: JamSessionPartType;
  label: string;
  userIds: string[];
};

/** 同じ人が複数のパートで手を挙げていても 1 人と数える */
export const memberCount = (entries: readonly Entry[]) =>
  new Set(entries.map(({ userId }) => userId)).size;

/** 未演奏の曲を先に、それぞれの中では人数の多い順、同数なら新しく挙がった順に並べる */
export const sortSongs = <T extends SortableSong>(songs: readonly T[]): T[] =>
  [...songs].sort(
    (a, b) =>
      Number(a.playedAt !== null) - Number(b.playedAt !== null) ||
      memberCount(b.entries) - memberCount(a.entries) ||
      b.createdAt.getTime() - a.createdAt.getTime(),
  );

const summaryKey = ({ part, partNote }: Entry) =>
  part === 'other' ? `other:${partNote ?? ''}` : part;

/**
 * 曲ごとのパート表示。募集を出すパートは空でも出し、それ以外は手を挙げた人がいるときだけ出す。
 * その他は楽器ごとに人を分けたいので、楽器名ごとに別のパートとして扱う。
 */
export const summarizeParts = (entries: readonly Entry[]): PartSummary[] => {
  const recruiting: PartSummary[] = SONG_RECRUITING_PARTS.map((part) => ({
    key: part,
    part,
    label: partLabel(part),
    userIds: [],
  }));

  const summaries = entries.reduce<PartSummary[]>((acc, entry) => {
    const key = summaryKey(entry);
    const found = acc.find((summary) => summary.key === key);
    if (found) {
      return acc.map((summary) =>
        summary === found ? { ...summary, userIds: [...summary.userIds, entry.userId] } : summary,
      );
    }
    return [
      ...acc,
      {
        key,
        part: entry.part,
        label: partLabel(entry.part, entry.partNote),
        userIds: [entry.userId],
      },
    ];
  }, recruiting);

  // sort は安定なので、同じ「その他」の楽器どうしは出てきた順のまま並ぶ
  return [...summaries].sort((a, b) => partOrder(a.part) - partOrder(b.part));
};
