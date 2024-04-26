'use client';

import React from 'react';

import { SimpleGrid, type SimpleGridProps, UnstyledButton } from '@mantine/core';

import MusicImage from '@/features/my-best-songs/components/MusicImage';

import type { SongWithImage } from '@/types/types';

export type MyBestSongsGridProps = Omit<SimpleGridProps, 'onClick'> & {
  data: SongWithImage[];
  onClick: (id: string) => () => void;
};

const MyBestSongsGrid: React.FC<MyBestSongsGridProps> = ({ data, onClick, ...props }) => {
  return (
    <SimpleGrid
      {...props}
      cols={{ base: 5, sm: 7 }}
      spacing={{ base: 4, sm: 'sm' }}
      verticalSpacing={{ base: 4, sm: 'sm' }}
    >
      {data.map((song) => (
        <div key={song.id}>
          <UnstyledButton display="block" onClick={onClick?.(song.id)}>
            <MusicImage song={song} size="100%" />
          </UnstyledButton>
        </div>
      ))}
    </SimpleGrid>
  );
};

export default MyBestSongsGrid;
