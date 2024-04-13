import { useCallback } from 'react';

import { showNotification } from '@mantine/notifications';
import { useQueryClient } from '@tanstack/react-query';
import { getQueryKey } from '@trpc/react-query';

import { NotificationOptions } from '@/constants/notification';
import { api } from '@/trpc/react';

import type { RouterOutputs } from '@/trpc/shared';

export const useDeleteSong = (userId: string) => {
  const queryClient = useQueryClient();
  const { mutateAsync } = api.myBestSongs.delete.useMutation();

  const deleteSong = useCallback(
    (id: string) => () => {
      // optimistic update
      const myBestSongsKey = getQueryKey(api.myBestSongs.findByUserId, { userId }, 'query');
      // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
      const prevData = queryClient.getQueryData(
        myBestSongsKey,
      ) as RouterOutputs['myBestSongs']['findByUserId'];
      if (prevData) {
        queryClient.setQueryData(
          myBestSongsKey,
          prevData.filter((song) => song.id !== id),
        );
      }

      return mutateAsync(
        {
          id,
        },
        {
          onError: (error) => {
            showNotification(NotificationOptions.error);
            console.error(error);
            void queryClient.invalidateQueries(myBestSongsKey);
          },
        },
      );
    },
    [mutateAsync, queryClient, userId],
  );

  return {
    deleteSong,
  };
};
