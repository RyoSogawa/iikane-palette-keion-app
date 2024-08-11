'use client';

import React, { useCallback } from 'react';

import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Flex, Loader } from '@mantine/core';
import { type ItemContent, Virtuoso } from 'react-virtuoso';

import SortableMusicCard from '@/features/my-best-songs/components/MyBestSongsListForEdit/parts/SortableMusicCard';
import { useDeleteSong } from '@/features/my-best-songs/hooks/useDeleteSong';
import { useFindSongsByUserId } from '@/features/my-best-songs/hooks/useFindSongsByUserId';
import { useSortSong } from '@/features/my-best-songs/hooks/useSortSong';
import { type MyBestSong } from '@/types/generated/zod';
import DnDContext from '@/ui/components/functional/DnDContext';

export type MyBestSongsListProps = {
  userId: string;
};

const MyBestSongsList: React.FC<MyBestSongsListProps> = ({ userId }) => {
  const { data, isFetching } = useFindSongsByUserId(userId);
  const { deleteSong } = useDeleteSong(userId);
  const { handleDragEnd } = useSortSong(userId);

  const itemContent = useCallback<ItemContent<MyBestSong, unknown>>(
    (_index, song) => <SortableMusicCard song={song} deleteSong={deleteSong} />,
    [deleteSong],
  );

  if (isFetching)
    return (
      <Flex align="center" justify="center" pt={120}>
        <Loader />
      </Flex>
    );

  return (
    <DnDContext onDragEnd={handleDragEnd}>
      <SortableContext items={data ?? []} strategy={verticalListSortingStrategy}>
        <Virtuoso data={data ?? []} itemContent={itemContent} useWindowScroll />
      </SortableContext>
    </DnDContext>
  );
};

export default MyBestSongsList;
