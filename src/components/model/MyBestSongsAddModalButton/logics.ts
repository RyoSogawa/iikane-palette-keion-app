import { useCallback, useState } from 'react';

import { showNotification } from '@mantine/notifications';
import { useQueryClient } from '@tanstack/react-query';
import { getQueryKey } from '@trpc/react-query';
import { useSession } from 'next-auth/react';
import { useDebounce } from 'react-use';

import { NotificationOptions } from '@/constants/notification';
import { api } from '@/trpc/react';
import { type MyBestSong } from '@/types/generated/zod';

import type { RouterOutputs } from '@/trpc/shared';

export const useSearchSongs = (searchValue: string) => {
  const [debouncedValue, setDebouncedValue] = useState('');

  useDebounce(
    () => {
      setDebouncedValue(searchValue);
    },
    1000,
    [searchValue],
  );

  const { data, isFetching } = api.myBestSongs.search.useQuery(
    {
      keyword: debouncedValue.trim(),
    },
    {
      enabled: !!debouncedValue,
    },
  );

  return {
    data,
    isFetching,
  };
};

export const useAddSong = (userId: string) => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const { mutateAsync } = api.myBestSongs.create.useMutation();
  const addSong = useCallback(
    (song: Pick<MyBestSong, 'spotifyId' | 'name' | 'artist' | 'image' | 'type'>) => () => {
      if (!session) {
        return;
      }

      // optimistic update
      const myBestSongsKey = getQueryKey(api.myBestSongs.findByUserId, { userId }, 'query');
      // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
      const prevData = queryClient.getQueryData(
        myBestSongsKey,
      ) as RouterOutputs['myBestSongs']['findByUserId'];
      queryClient.setQueryData(myBestSongsKey, prevData ? [...prevData, song] : [song]);

      return mutateAsync(
        {
          userId: session.user.id,
          ...song,
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
    [mutateAsync, queryClient, session, userId],
  );

  return {
    addSong,
  };
};
