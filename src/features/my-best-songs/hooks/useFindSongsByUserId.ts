import { api } from '@/trpc/react';

export const useFindSongsByUserId = (userId: string) => {
  const { data, isFetching } = api.myBestSongs.findByUserId.useQuery({
    userId,
  });

  return {
    data,
    isFetching,
  };
};
