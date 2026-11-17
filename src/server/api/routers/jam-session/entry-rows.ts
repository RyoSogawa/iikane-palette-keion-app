import type { JamSessionPart } from '@prisma/client';

/** 挙手の行。楽器名は「その他」の行にだけ持たせる */
export const toEntryRows = (userId: string, parts: JamSessionPart[], partNote: string | null) =>
  parts.map((part) => ({ userId, part, partNote: part === 'other' ? partNote : null }));
