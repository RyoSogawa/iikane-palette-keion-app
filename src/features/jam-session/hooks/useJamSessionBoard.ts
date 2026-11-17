import { useEffect, useMemo } from 'react';

import { showNotification } from '@mantine/notifications';
import { useRouter } from 'next/navigation';

import { sortSongs } from '@/features/jam-session/logics/song-list';
import { api } from '@/trpc/react';

import type { JamSessionBoard } from '@/features/jam-session/types';

const POLLING_INTERVAL_MS = 5000;

/**
 * セッションのボード。ほかの人の操作を拾うため 5 秒おきに取り直す。
 * React Query の既定で、タブが裏にある間は止まり、戻ったときに取り直す。
 * ほかの人がセッションを消したら、古い表示のまま操作させないよう一覧へ戻す。
 * 自分で消したあとは、一覧へ移るまでの間に取り直して 404 にならないよう enabled を落とす。
 */
export const useJamSessionBoard = (initialData: JamSessionBoard, enabled = true) => {
  const router = useRouter();
  const { data, error } = api.jamSession.board.useQuery(
    { sessionId: initialData.session.id },
    {
      initialData,
      enabled,
      refetchInterval: POLLING_INTERVAL_MS,
      retry: (failureCount, err) => err.data?.code !== 'NOT_FOUND' && failureCount < 3,
    },
  );
  const isDeleted = error?.data?.code === 'NOT_FOUND';

  useEffect(() => {
    if (!isDeleted) return;
    showNotification({ color: 'orange', message: 'このセッションは削除されました' });
    router.replace('/jam-session');
  }, [isDeleted, router]);

  const participantsById = useMemo(
    () => new Map(data.participants.map((participant) => [participant.userId, participant])),
    [data.participants],
  );
  const songs = useMemo(() => sortSongs(data.songs), [data.songs]);

  return { ...data, songs, participantsById };
};
