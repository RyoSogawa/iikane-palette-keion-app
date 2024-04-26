'use client';

import React from 'react';

import { Image, SimpleGrid } from '@mantine/core';

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
          <Image
            src={song.image}
            alt={song.name}
            width={78}
            height={78}
            w="100%"
            h="100%"
            loading="lazy"
            bg="gray"
          />
        </div>
      ))}
    </SimpleGrid>
  );
};

export default MyBestSongsGrid;
