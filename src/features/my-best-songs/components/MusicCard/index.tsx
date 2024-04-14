import React from 'react';

import { Box, Group, Image, Paper, Text } from '@mantine/core';

import MusicTypeBadge from '@/features/my-best-songs/components/MusicTypeBadge';
import { type SongTypeType } from '@/types/generated/zod';

export type MusicCardProps = {
  type: SongTypeType;
  artist: string;
  name: string;
  image?: string;
  rightSlot?: React.ReactElement;
};

const MusicCard: React.FC<MusicCardProps> = ({ artist, image, name, type, rightSlot }) => {
  return (
    <Paper p="xs" bg="transparent">
      <Group h="100%" wrap="nowrap">
        <Image src={image} alt={name} w={60} width={60} height={60} loading="lazy" bg="gray" />
        <Box flex={1} pb={4}>
          <MusicTypeBadge type={type} />
          <Text mt={4} size="sm" fw={500} c="bright" lineClamp={1}>
            {name}
          </Text>
          <Text lineClamp={1} c="dimmed" fz="xs">
            {artist}
          </Text>
        </Box>
        {rightSlot}
      </Group>
    </Paper>
  );
};

export default MusicCard;
