import { useCallback } from 'react';

import { showNotification } from '@mantine/notifications';
import { TRPCClientError } from '@trpc/client';

import { NotificationOptions } from '@/constants/notification';
import { api } from '@/trpc/react';

// サーバーが理由を書いて返すエラーは、そのまま見せたほうが次にどうすればよいか分かる
const USER_FACING_CODES = ['CONFLICT', 'FORBIDDEN', 'BAD_REQUEST', 'NOT_FOUND'];

const notifyError = (error: unknown) => {
  const code = error instanceof TRPCClientError ? (error.data as { code?: string })?.code : null;
  const isUserFacing = code && USER_FACING_CODES.includes(code);
  showNotification({
    ...NotificationOptions.error,
    message:
      isUserFacing && error instanceof Error ? error.message : NotificationOptions.error.message,
  });
};

/** セッションの更新系の操作。成功したらすぐ取り直し、ポーリングを待たずに反映する */
export const useJamSessionMutations = () => {
  const utils = api.useUtils();
  const options = {
    // 参加・退出で重なっているアーティストも変わるので、board だけでなくセッション全体を取り直す
    onSuccess: () => utils.jamSession.invalidate(),
    onError: notifyError,
  };

  const join = api.jamSession.join.useMutation(options);
  const leave = api.jamSession.leave.useMutation(options);
  const createSong = api.jamSession.createSong.useMutation(options);
  const deleteSong = api.jamSession.deleteSong.useMutation(options);
  const setMyParts = api.jamSession.setMyParts.useMutation(options);
  const setPlayed = api.jamSession.setPlayed.useMutation(options);

  const isPending = [join, leave, createSong, deleteSong, setMyParts, setPlayed].some(
    ({ isPending: pending }) => pending,
  );

  const run = useCallback(
    <T>(promise: Promise<T>) => promise.then(() => true).catch(() => false),
    [],
  );

  return { join, leave, createSong, deleteSong, setMyParts, setPlayed, isPending, run };
};
