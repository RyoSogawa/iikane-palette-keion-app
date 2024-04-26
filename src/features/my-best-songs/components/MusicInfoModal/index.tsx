'use client';

import React from 'react';

import { Button, Modal, type ModalProps, Text } from '@mantine/core';
import { IconBrandSpotify } from '@tabler/icons-react';
import Link from 'next/link';

import MusicImage from '@/features/my-best-songs/components/MusicImage';
import MusicTypeBadge from '@/features/my-best-songs/components/MusicTypeBadge';
import { type SongWithImage } from '@/types/types';

export type MusicInfoModalProps = ModalProps & {
  song: Pick<SongWithImage, 'id' | 'spotifyId' | 'type' | 'name' | 'artist' | 'image'>;
};

const MusicInfoModal: React.FC<MusicInfoModalProps> = ({ song, ...props }) => {
  return (
    <Modal {...props}>
      <div>
        <MusicImage song={song} size="100%" />
        <MusicTypeBadge type={song.type} size="sm" mt={16} />
        <Text mt={8} size="md" fw={500} c="bright">
          {song.name}
        </Text>
        <Text mt={4} c="dimmed" fz="sm">
          {song.artist}
        </Text>
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
      </div>
    </Modal>
  );
};

export default MusicInfoModal;
