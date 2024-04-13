import { useCallback } from 'react';

import { showNotification } from '@mantine/notifications';
import { useQueryClient } from '@tanstack/react-query';
import { getQueryKey } from '@trpc/react-query';

import { NotificationOptions } from '@/constants/notification';
import { api } from '@/trpc/react';
import { type RouterOutputs } from '@/trpc/shared';

export const useFetchData = (userId: string) => {
  const { data, isFetching } = api.myBestSongs.findByUserId.useQuery({
    userId,
  });

  return {
    data,
    isFetching,
  };
};

export const useDeleteSong = (userId: string) => {
  const queryClient = useQueryClient();
  const { mutateAsync } = api.myBestSongs.delete.useMutation();

  const deleteSong = useCallback(
    (id: string) => () => {
      return mutateAsync(
        {
          id,
        },
        {
          onSuccess: () => {
            const myBestSongsKey = getQueryKey(api.myBestSongs.findByUserId, { userId }, 'query');
            // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
            const prevData = queryClient.getQueryData(
              myBestSongsKey,
            ) as RouterOutputs['myBestSongs']['findByUserId'];
            if (!prevData) return;

            queryClient.setQueryData(
              myBestSongsKey,
              prevData.filter((song) => song.id !== id),
            );
          },
          onError: (error) => {
            showNotification(NotificationOptions.error);
            console.error(error);
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
