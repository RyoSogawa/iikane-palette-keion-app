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
