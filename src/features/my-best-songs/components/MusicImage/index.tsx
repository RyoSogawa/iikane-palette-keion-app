import React from 'react';

import { Flex, Image } from '@mantine/core';

import { type SongWithImage } from '@/types/types';

export type MusicImageProps = {
  song: Pick<SongWithImage, 'image' | 'name'>;
  size?: number | string;
};

const MusicImage: React.FC<MusicImageProps> = ({ song, size }) => {
  return song.image ? (
    <Image
      src={song.image}
      alt={song.name}
      w={size}
      h={size}
      width={160}
      height={160}
      loading="lazy"
      bg="gray"
    />
  ) : (
    <Flex w={size} h={size} bg="gray" fz="xs" align="center" justify="center">
      No
      <br />
      Image
    </Flex>
  );
};

export default MusicImage;
