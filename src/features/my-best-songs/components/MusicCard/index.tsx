import React from 'react';

import { Box, Group, Image, Paper, Text } from '@mantine/core';

import MusicTypeBadge from '@/features/my-best-songs/components/MusicTypeBadge';
import { type SongTypeType } from '@/types/generated/zod';

export type MusicCardProps = React.ComponentProps<'div'> & {
  type: SongTypeType;
  artist: string;
  name: string;
  image?: string;
  leftSlot?: React.ReactElement;
  rightSlot?: React.ReactElement;
};

const MusicCard = React.forwardRef<HTMLDivElement, MusicCardProps>(
  ({ artist, image, name, type, leftSlot, rightSlot, ...props }, forwardedRef) => {
    return (
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      <Paper ref={forwardedRef} p="xs" bg="transparent" {...props}>
        <Group h="100%" wrap="nowrap">
          {leftSlot}
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
  },
);

MusicCard.displayName = 'MusicCard';
export default MusicCard;
