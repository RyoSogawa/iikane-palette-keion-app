'use client';

import React from 'react';

import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { Flex, Loader, SimpleGrid } from '@mantine/core';

import DnDContext from '@/components/functional/DnDContext';
import SortableMusicImage from '@/features/my-best-songs/components/MyBestSongsGridForEdit/parts/SortableMusicImage';
import { useDeleteSong } from '@/features/my-best-songs/hooks/useDeleteSong';
import { useFindSongsByUserId } from '@/features/my-best-songs/hooks/useFindSongsByUserId';
import { useSortSong } from '@/features/my-best-songs/hooks/useSortSong';

export type MyBestSongsGridForEditProps = {
  userId: string;
};

const MyBestSongsGridForEdit: React.FC<MyBestSongsGridForEditProps> = ({ userId }) => {
  const { data, isFetching } = useFindSongsByUserId(userId);
  const { deleteSong } = useDeleteSong(userId);
  const { handleDragEnd } = useSortSong(userId);

  if (isFetching)
    return (
      <Flex align="center" justify="center" pt={120}>
        <Loader />
      </Flex>
    );

  return (
    <DnDContext onDragEnd={handleDragEnd}>
      <SortableContext items={data ?? []} strategy={rectSortingStrategy}>
        <SimpleGrid
          cols={{ base: 4, sm: 6 }}
          spacing={{ base: 'xs', sm: 'sm' }}
          verticalSpacing={{ base: 'xs', sm: 'sm' }}
        >
          {data?.map((song) => <SortableMusicImage key={song.id} song={song} />)}
        </SimpleGrid>
      </SortableContext>
    </DnDContext>
  );
};

export default MyBestSongsGridForEdit;
