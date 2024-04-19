import { useState } from 'react';

import { useDebounce } from 'react-use';

import { api } from '@/trpc/react';
import { type SongTypeType } from '@/types/generated/zod';

export const useSearchSpotify = (searchValue: string, searchType: SongTypeType) => {
  const [debouncedValue, setDebouncedValue] = useState('');

  useDebounce(
    () => {
      if (searchValue.trim() === debouncedValue.trim()) {
        return;
      }
      setDebouncedValue(searchValue);
    },
    1000,
    [searchValue],
  );

  const { data, isFetching } = api.myBestSongs.search.useQuery(
    {
      keyword: debouncedValue.trim(),
      type: searchType,
    },
    {
      enabled: !!debouncedValue,
      refetchOnWindowFocus: false,
    },
  );

  return {
    data,
    isFetching,
  };
};
