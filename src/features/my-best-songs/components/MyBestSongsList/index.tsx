'use client';

import React, { useCallback } from 'react';

import { ActionIcon, Flex, Loader } from '@mantine/core';
import { IconBrandSpotify, IconTrash } from '@tabler/icons-react';
import Link from 'next/link';
import { type ItemContent, Virtuoso } from 'react-virtuoso';

import MusicCard from '@/features/my-best-songs/components/MusicCard';
import { useDeleteSong } from '@/features/my-best-songs/hooks/useDeleteSong';
import { useFindSongsByUserId } from '@/features/my-best-songs/hooks/useFindSongsByUserId';
import { type MyBestSong } from '@/types/generated/zod';

export type MyBestSongsListProps = {
  userId: string;
  editable?: boolean;
};

const MyBestSongsList: React.FC<MyBestSongsListProps> = ({ userId, editable }) => {
  const { data, isFetching } = useFindSongsByUserId(userId);
  const { deleteSong } = useDeleteSong(userId);

  const itemContent = useCallback<ItemContent<MyBestSong, unknown>>(
    (_index, song) =>
      song && (
        <MusicCard
          type={song.type}
          artist={song.artist}
          name={song.name}
          image={song.image}
          rightSlot={
            editable ? (
              <ActionIcon
                radius="50%"
                aria-label="削除する"
                color="red"
                variant="outline"
                onClick={deleteSong(song.id)}
              >
                <IconTrash size={16} />
              </ActionIcon>
            ) : (
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
            )
          }
        />
      ),
    [deleteSong, editable],
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
