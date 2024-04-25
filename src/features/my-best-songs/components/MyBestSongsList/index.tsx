'use client';

import React, { useCallback } from 'react';

import { ActionIcon, Tooltip } from '@mantine/core';
import { IconBrandSpotify } from '@tabler/icons-react';
import Link from 'next/link';
import { type ItemContent, Virtuoso } from 'react-virtuoso';

import MusicCard from '@/features/my-best-songs/components/MusicCard';
import { type SongWithImage } from '@/types/types';

export type MyBestSongsListProps = {
  data: SongWithImage[];
};

const MyBestSongsList: React.FC<MyBestSongsListProps> = ({ data }) => {
  const itemContent = useCallback<ItemContent<SongWithImage, unknown>>(
    (_index, song) =>
      song && (
        <MusicCard
          type={song.type}
          artist={song.artist}
          name={song.name}
          image={song.image}
          rightSlot={
            <Tooltip label="Spotifyで聴く" openDelay={500}>
              <ActionIcon
                component={Link}
                href={`https://open.spotify.com/intl-ja/${song.type}/${song.spotifyId}`}
                target="_blank"
                rel="noreferrer"
                radius="50%"
                variant="outline"
                color="#2ebd59"
                aria-label="Spotifyで聴く"
              >
                <IconBrandSpotify size={16} />
              </ActionIcon>
            </Tooltip>
          }
        />
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
