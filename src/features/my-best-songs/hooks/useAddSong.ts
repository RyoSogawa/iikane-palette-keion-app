import { useCallback } from 'react';

import { showNotification } from '@mantine/notifications';
import { useQueryClient } from '@tanstack/react-query';
import { getQueryKey } from '@trpc/react-query';
import { useSession } from 'next-auth/react';

import { NotificationOptions } from '@/constants/notification';
import { api } from '@/trpc/react';

import type { RouterOutputs } from '@/trpc/shared';
import type { MyBestSong } from '@/types/generated/zod';

export const useAddSong = (userId: string) => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const { mutateAsync, isLoading } = api.myBestSongs.create.useMutation();

  const addSong = useCallback(
    (song: Pick<MyBestSong, 'spotifyId' | 'name' | 'artist' | 'type'>) => () => {
      if (!session) {
        return;
      }

      const myBestSongsKey = getQueryKey(api.myBestSongs.findByUserId, { userId }, 'query');

      return mutateAsync(
        {
          userId: session.user.id,
          ...song,
        },
        {
          onSuccess: (data) => {
            // キャッシュに追加する
            // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
            const prevData = queryClient.getQueryData(
              myBestSongsKey,
            ) as RouterOutputs['myBestSongs']['findByUserId'];
            queryClient.setQueryData(myBestSongsKey, prevData ? [...prevData, data] : [data]);
          },
          onError: (error) => {
            showNotification(NotificationOptions.error);
            console.error(error);
            void queryClient.invalidateQueries(myBestSongsKey);
          },
        },
      );
    },
    [mutateAsync, queryClient, session, userId],
  );

  return {
    isAdding: isLoading,
    addSong,
  };
};
