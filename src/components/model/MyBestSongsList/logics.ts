import { useCallback } from 'react';

import { showNotification } from '@mantine/notifications';

import { NotificationOptions } from '@/constants/notification';
import { api } from '@/trpc/react';

export const useFetchData = (userId: string) => {
  const { data, isFetching } = api.myBestSongs.findByUserId.useQuery({
    userId,
  });

  return {
    data,
    isFetching,
  };
};

export const useDeleteSong = () => {
  const { mutateAsync } = api.myBestSongs.delete.useMutation();

  const deleteSong = useCallback(
    (id: string) => () => {
      return mutateAsync(
        {
          id,
        },
        {
          onSuccess: () => {},
          onError: (error) => {
            showNotification(NotificationOptions.error);
            console.error(error);
          },
        },
      );
    },
    [mutateAsync],
  );

  return {
    deleteSong,
  };
};
