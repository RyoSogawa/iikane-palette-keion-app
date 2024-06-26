import React from 'react';

import { ThemeIcon, UnstyledButton } from '@mantine/core';
import { IconCheck, IconPlus } from '@tabler/icons-react';

import MusicCard from '@/features/my-best-songs/components/MusicCard';
import s from '@/features/my-best-songs/components/MyBestSongsAddModalButton/style.module.css';
import { type SongWithImage } from '@/types/types';

export type MusicCardButtonProps = {
  song: Pick<SongWithImage, 'type' | 'artist' | 'name' | 'image'>;
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
            <ThemeIcon radius="50%">
              <IconPlus size={16} />
            </ThemeIcon>
          ) : (
            <ThemeIcon radius="50%" color="green" variant="outline">
              <IconCheck size={16} />
            </ThemeIcon>
          )
        }
      />
    </UnstyledButton>
  );
};

export default MusicCardButton;
