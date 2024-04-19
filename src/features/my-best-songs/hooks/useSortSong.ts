import { useCallback } from 'react';

import { type DragEndEvent } from '@dnd-kit/core';
import { showNotification } from '@mantine/notifications';
import { useQueryClient } from '@tanstack/react-query';
import { getQueryKey } from '@trpc/react-query';

import { NotificationOptions } from '@/constants/notification';
import { api } from '@/trpc/react';
import { type RouterOutputs } from '@/trpc/shared';

export const useSortSong = (userId: string) => {
  const queryClient = useQueryClient();
  const { mutateAsync, isLoading } = api.myBestSongs.sort.useMutation();

  const handleDragEnd = useCallback(
    async (e: DragEndEvent) => {
      const { active, over } = e;

      if (!over || active.id === over.id) return;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const newOrder = Number(over.data.current?.sortable.index);

      if (newOrder === undefined) return;

      const myBestSongsKey = getQueryKey(api.myBestSongs.findByUserId, { userId }, 'query');

      // キャッシュ更新
      // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
      const prevData = queryClient.getQueryData(
        myBestSongsKey,
      ) as RouterOutputs['myBestSongs']['findByUserId'];
      const newData = [...prevData];
      const oldIndex = prevData.findIndex((d) => d.id === active.id);
      const data = prevData[oldIndex];
      if (oldIndex !== -1) {
        newData.splice(oldIndex, 1);
      }
      if (data) {
        newData.splice(newOrder, 0, data);
      }
      queryClient.setQueryData(myBestSongsKey, newData);

      await mutateAsync(
        {
          id: String(active.id),
          newOrder,
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
    isSorting: isLoading,
    handleDragEnd,
  };
};
