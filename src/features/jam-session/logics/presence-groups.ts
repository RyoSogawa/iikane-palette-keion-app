import { type JamSessionPartType } from '@/types/generated/zod';

import { JAM_SESSION_PARTS, partLabel, PRESENCE_ALWAYS_SHOWN_PARTS } from './parts';
import { ROOT_OPTIONS } from './roots';

type Person = {
  userId: string;
  parts: readonly JamSessionPartType[];
  partNote: string | null;
  roots: readonly string[];
};

export type PresenceGroup<T> = { key: string; label: string; members: T[] };

/** パートごとに人をまとめる。複数パートの人はそれぞれに出る。いないパートが分かるよう主要パートは空でも出す */
export const groupByPart = <T extends Person>(people: readonly T[]): PresenceGroup<T>[] => {
  const byPart = JAM_SESSION_PARTS.flatMap(({ value: part }) => {
    if (part === 'other') return [];
    const members = people.filter(({ parts }) => parts.includes(part));
    if (members.length === 0 && !PRESENCE_ALWAYS_SHOWN_PARTS.includes(part)) return [];
    return [{ key: part, label: partLabel(part), members }];
  });

  const others = people
    .filter(({ parts }) => parts.includes('other'))
    .reduce<PresenceGroup<T>[]>((acc, person) => {
      const label = partLabel('other', person.partNote);
      const key = `other:${label}`;
      const found = acc.find((group) => group.key === key);
      return found
        ? acc.map((group) =>
            group === found ? { ...group, members: [...group.members, person] } : group,
          )
        : [...acc, { key, label, members: [person] }];
    }, []);

  return [...byPart, ...others];
};

/** ルーツごとに人をまとめる。選択肢の順に出し、自由入力のルーツは出てきた順にその後ろへ並べる */
export const groupByRoots = <T extends Person>(people: readonly T[]): PresenceGroup<T>[] => {
  const freeRoots = people
    .flatMap(({ roots }) => roots)
    .filter((root) => !ROOT_OPTIONS.includes(root));
  const labels = [...new Set([...ROOT_OPTIONS, ...freeRoots])];

  return labels
    .map((label) => ({
      key: label,
      label,
      members: people.filter(({ roots }) => roots.includes(label)),
    }))
    .filter(({ members }) => members.length > 0);
};
