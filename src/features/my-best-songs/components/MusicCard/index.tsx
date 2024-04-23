import React from 'react';

import { Box, Flex, Group, Image, Paper, Text } from '@mantine/core';

import MusicTypeBadge from '@/features/my-best-songs/components/MusicTypeBadge';
import { type SongTypeType } from '@/types/generated/zod';

import s from './style.module.css';

export type MusicCardProps = React.ComponentProps<'div'> & {
  type: SongTypeType;
  artist: string;
  name: string;
  image?: string;
  leftSlot?: React.ReactElement;
  rightSlot?: React.ReactElement;
};

const MusicCard = React.forwardRef<HTMLDivElement, MusicCardProps>(
  ({ artist, image, name, type, leftSlot, rightSlot, className, ...props }, forwardedRef) => {
    return (
      <Paper
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        ref={forwardedRef}
        py="xs"
        px={{ base: 'xs', sm: 'lg' }}
        className={`${s.wrapper} ${className}`}
        {...props}
      >
        <Group h="100%" wrap="nowrap">
          {leftSlot}
          {image ? (
            <Image src={image} alt={name} w={60} width={60} height={60} loading="lazy" bg="gray" />
          ) : (
            <Flex w={60} h={60} bg="gray" fz="xs" align="center" justify="center">
              No
              <br />
              Image
            </Flex>
          )}
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
