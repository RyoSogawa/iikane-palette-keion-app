import { useState } from 'react';

import { useDebounce } from 'react-use';

import { api } from '@/trpc/react';

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
