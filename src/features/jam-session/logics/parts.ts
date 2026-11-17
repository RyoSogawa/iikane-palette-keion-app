import { type JamSessionPartType } from '@/types/generated/zod';

/** セッションのパートの表示名と並び順。画面とロジックはすべてこの順で並べる */
export const JAM_SESSION_PARTS: ReadonlyArray<{ value: JamSessionPartType; label: string }> = [
  { value: 'vocal', label: 'Vo' },
  { value: 'guitar', label: 'Gt' },
  { value: 'bass', label: 'Ba' },
  { value: 'drums', label: 'Dr' },
  { value: 'keyboard', label: 'Key' },
  { value: 'wind', label: '管楽器' },
  { value: 'strings', label: '弦楽器' },
  { value: 'percussion', label: 'Perc' },
  { value: 'other', label: 'その他' },
];

/** 曲の一覧で、誰もいなくても「募集」として出すパート */
export const SONG_RECRUITING_PARTS: readonly JamSessionPartType[] = [
  'vocal',
  'guitar',
  'bass',
  'drums',
];

/** 「いまここにいる人」のパート別で、誰もいなくても出すパート */
export const PRESENCE_ALWAYS_SHOWN_PARTS: readonly JamSessionPartType[] = [
  ...SONG_RECRUITING_PARTS,
  'keyboard',
];

const PART_ORDER = new Map(JAM_SESSION_PARTS.map(({ value }, index) => [value, index]));

export const partOrder = (part: JamSessionPartType) => PART_ORDER.get(part) ?? 0;

export const partLabel = (part: JamSessionPartType, partNote?: string | null) => {
  if (part === 'other' && partNote) return partNote;
  return JAM_SESSION_PARTS[partOrder(part)]?.label ?? part;
};

export const sortParts = (parts: readonly JamSessionPartType[]) =>
  [...parts].sort((a, b) => partOrder(a) - partOrder(b));
