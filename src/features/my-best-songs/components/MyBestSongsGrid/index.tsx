'use client';

import React from 'react';

import { SimpleGrid } from '@mantine/core';

import MusicImage from '@/features/my-best-songs/components/MusicImage';

import type { SongWithImage } from '@/types/types';

export type MyBestSongsGridProps = {
  data: SongWithImage[];
};

const MyBestSongsGrid: React.FC<MyBestSongsGridProps> = ({ data }) => {
  return (
    <SimpleGrid
      cols={{ base: 3, sm: 6 }}
      spacing={{ base: 4, sm: 'sm' }}
      verticalSpacing={{ base: 4, sm: 'sm' }}
    >
      {data.map((song) => (
        <div key={song.id}>
          <MusicImage song={song} size="100%" />
        </div>
      ))}
    </SimpleGrid>
  );
};

export default MyBestSongsGrid;
