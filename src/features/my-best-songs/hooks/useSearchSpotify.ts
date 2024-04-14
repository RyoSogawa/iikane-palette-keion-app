import { useState } from 'react';

import { useDebounce } from 'react-use';

import { api } from '@/trpc/react';
import { type SongTypeType } from '@/types/generated/zod';

export const useSearchSpotify = (searchValue: string, searchType: SongTypeType) => {
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
      type: searchType,
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
