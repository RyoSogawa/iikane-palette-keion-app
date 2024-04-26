'use client';

import React, { useCallback } from 'react';

import { UnstyledButton } from '@mantine/core';
import { type ItemContent, Virtuoso } from 'react-virtuoso';

import MusicCard from '@/features/my-best-songs/components/MusicCard';
import { type SongWithImage } from '@/types/types';

export type MyBestSongsListProps = {
  data: SongWithImage[];
  onClick?: (id: string) => () => void;
};

const MyBestSongsList: React.FC<MyBestSongsListProps> = ({ data, onClick }) => {
  const itemContent = useCallback<ItemContent<SongWithImage, unknown>>(
    (_index, song) =>
      song && (
        <UnstyledButton display="block" w="100%" onClick={onClick?.(song.id)}>
          <MusicCard type={song.type} artist={song.artist} name={song.name} image={song.image} />
        </UnstyledButton>
      ),
    [],
  );

  return (
    <Virtuoso
      style={{ minHeight: 72 * data.length }}
      data={data ?? []}
      itemContent={itemContent}
      useWindowScroll
    />
  );
};

export default MyBestSongsList;
