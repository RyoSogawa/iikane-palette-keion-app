import type { RouterOutputs } from '@/trpc/shared';

export type JamSessionBoard = RouterOutputs['jamSession']['board'];
export type JamSessionParticipantView = JamSessionBoard['participants'][number];
export type JamSessionSongView = JamSessionBoard['songs'][number];
export type JamSessionViewer = JamSessionBoard['viewer'];
