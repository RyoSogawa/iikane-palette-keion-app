'use client';

import React, { useCallback } from 'react';

import { Flex, Loader } from '@mantine/core';
import { type ItemContent, Virtuoso } from 'react-virtuoso';

import MusicCard from '@/components/model/MusicCard';
import { useFetchData } from '@/components/model/MyBestSongsList/logics';
import { type MyBestSong } from '@/types/generated/zod';

export type MyBestSongsListProps = {
  userId: string;
};

const MyBestSongsList: React.FC<MyBestSongsListProps> = ({ userId }) => {
  const { data, isFetching } = useFetchData(userId);
  const itemContent = useCallback<ItemContent<MyBestSong, unknown>>(
    (_index, song) =>
      song && (
        <MusicCard type={song.type} artist={song.artist} name={song.name} image={song.image} />
      ),
    [],
  );

  if (isFetching)
    return (
      <Flex align="center" justify="center" pt={120}>
        <Loader />
      </Flex>
    );

  return <Virtuoso data={data ?? []} itemContent={itemContent} useWindowScroll />;
};

export default MyBestSongsList;
