import React from 'react';

import { ActionIcon, UnstyledButton } from '@mantine/core';
import { IconCheck, IconPlus } from '@tabler/icons-react';

import MusicCard from '@/features/my-best-songs/components/MusicCard';
import s from '@/features/my-best-songs/components/MyBestSongsAddModalButton/style.module.css';
import { type MyBestSong } from '@/types/generated/zod';

export type MusicCardButtonProps = {
  song: Pick<MyBestSong, 'type' | 'artist' | 'name' | 'image'>;
  forAdd?: boolean;
  disabledToAdd?: boolean;
  onAdd?: () => void;
  onRemove?: () => void;
};

const MusicCardButton: React.FC<MusicCardButtonProps> = ({
  song,
  forAdd,
  disabledToAdd,
  onAdd,
  onRemove,
}) => {
  return (
    <UnstyledButton
      className={`${s.modalBodySpace} ${s.musicCard}`}
      disabled={forAdd && disabledToAdd}
      aria-label={forAdd ? 'my best songsに追加' : '削除'}
      onClick={forAdd ? onAdd : onRemove}
    >
      <MusicCard
        type={song.type}
        artist={song.artist}
        name={song.name}
        image={song.image}
        rightSlot={
          forAdd ? (
            <ActionIcon component="span" radius="50%">
              <IconPlus size={16} />
            </ActionIcon>
          ) : (
            <ActionIcon component="span" radius="50%" color="green" variant="outline">
              <IconCheck size={16} />
            </ActionIcon>
          )
        }
      />
    </UnstyledButton>
  );
};

export default MusicCardButton;
