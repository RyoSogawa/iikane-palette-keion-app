import { useCallback, useState } from 'react';

import { showNotification } from '@mantine/notifications';
import { useSession } from 'next-auth/react';
import { useDebounce } from 'react-use';

import { NotificationOptions } from '@/constants/notification';
import { api } from '@/trpc/react';
import { type MyBestSong } from '@/types/generated/zod';

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

export const useAddSong = () => {
  const { data: session } = useSession();
  const { mutateAsync } = api.myBestSongs.add.useMutation();
  const addSong = useCallback(
    (song: Pick<MyBestSong, 'spotifyId' | 'name' | 'artist' | 'image'>) => () => {
      if (!session) {
        return;
      }
      return mutateAsync(
        {
          userId: session.user.id,
          ...song,
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
    [mutateAsync, session],
  );

  return {
    addSong,
  };
};
