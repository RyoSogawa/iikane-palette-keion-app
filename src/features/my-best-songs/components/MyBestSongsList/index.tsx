'use client';

import React, { useCallback } from 'react';

import { ActionIcon, Flex, Loader } from '@mantine/core';
import { IconBrandSpotify } from '@tabler/icons-react';
import Link from 'next/link';
import { type ItemContent, Virtuoso } from 'react-virtuoso';

import MusicCard from '@/features/my-best-songs/components/MusicCard';
import { useFindSongsByUserId } from '@/features/my-best-songs/hooks/useFindSongsByUserId';
import { type MyBestSong } from '@/types/generated/zod';

export type MyBestSongsListProps = {
  userId: string;
};

const MyBestSongsList: React.FC<MyBestSongsListProps> = ({ userId }) => {
  const { data, isFetching } = useFindSongsByUserId(userId);

  const itemContent = useCallback<ItemContent<MyBestSong, unknown>>(
    (_index, song) =>
      song && (
        <MusicCard
          type={song.type}
          artist={song.artist}
          name={song.name}
          image={song.image}
          rightSlot={
            <ActionIcon
              component={Link}
              href={`https://open.spotify.com/intl-ja/${song.type}/${song.spotifyId}`}
              target="_blank"
              rel="noreferrer"
              radius="50%"
              variant="outline"
              color="#2ebd59"
              aria-label="Spotifyで開く"
            >
              <IconBrandSpotify size={16} />
            </ActionIcon>
          }
        />
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
