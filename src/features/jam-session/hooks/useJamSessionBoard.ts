import { useMemo } from 'react';

import { sortSongs } from '@/features/jam-session/logics/song-list';
import { api } from '@/trpc/react';

import type { JamSessionBoard } from '@/features/jam-session/types';

const POLLING_INTERVAL_MS = 5000;

/**
 * セッションのボード。ほかの人の操作を拾うため 5 秒おきに取り直す。
 * React Query の既定で、タブが裏にある間は止まり、戻ったときに取り直す。
 */
export const useJamSessionBoard = (initialData: JamSessionBoard) => {
  const { data } = api.jamSession.board.useQuery(
    { sessionId: initialData.session.id },
    {
      initialData,
      refetchInterval: POLLING_INTERVAL_MS,
    },
  );

  const participantsById = useMemo(
    () => new Map(data.participants.map((participant) => [participant.userId, participant])),
    [data.participants],
  );
  const songs = useMemo(() => sortSongs(data.songs), [data.songs]);

  return { ...data, songs, participantsById };
};
