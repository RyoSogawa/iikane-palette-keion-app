'use client';

import React from 'react';

import { Button, Group, Modal, type ModalProps, Space, Text } from '@mantine/core';
import { IconBrandSpotify } from '@tabler/icons-react';
import Link from 'next/link';

import MusicImage from '@/features/my-best-songs/components/MusicImage';
import NextPrevButton from '@/features/my-best-songs/components/MusicInfoModal/parts/NextPrevButton';
import MusicTypeBadge from '@/features/my-best-songs/components/MusicTypeBadge';
import { type SongWithImage } from '@/types/types';

export type MusicInfoModalProps = ModalProps & {
  song?: Pick<SongWithImage, 'id' | 'spotifyId' | 'type' | 'name' | 'artist' | 'image'>;
  openNext: () => void;
  openPrev: () => void;
  nextSongExists: boolean;
  prevSongExists: boolean;
};

const MusicInfoModal: React.FC<MusicInfoModalProps> = ({
  song,
  openNext,
  openPrev,
  nextSongExists,
  prevSongExists,
  ...props
}) => {
  return (
    <Modal {...props}>
      {song && (
        <div>
          <MusicImage song={song} size="100%" />
          <MusicTypeBadge type={song.type} size="sm" mt={16} />
          <Text mt={8} size="md" fw={500} c="bright">
            {song.name}
          </Text>
          <Text mt={4} c="dimmed" fz="sm">
            {song.artist}
          </Text>
          <Group>
            <Button
              component={Link}
              href={`https://open.spotify.com/intl-ja/${song.type}/${song.spotifyId}`}
              target="_blank"
              rel="noreferrer"
              mt={16}
              color="#2ebd59"
              variant="outline"
              leftSection={<IconBrandSpotify size={16} />}
              size="xs"
            >
              Spotifyで聴く
            </Button>
            <Space flex={1} />
            <NextPrevButton dir="prev" disabled={!prevSongExists} onClick={openPrev} />
            <NextPrevButton dir="next" disabled={!nextSongExists} onClick={openNext} />
          </Group>
        </div>
      )}
    </Modal>
  );
};

export default MusicInfoModal;
