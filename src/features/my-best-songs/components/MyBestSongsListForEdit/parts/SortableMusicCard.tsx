import React, { useMemo } from 'react';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ActionIcon } from '@mantine/core';
import { IconGripVertical, IconTrash } from '@tabler/icons-react';

import MusicCard from '@/features/my-best-songs/components/MusicCard';
import { type MyBestSong } from '@/types/generated/zod';

export type SortableMusicCardProps = {
  song: Pick<MyBestSong, 'id' | 'type' | 'artist' | 'name'>;
  deleteSong: (id: string) => () => void;
};

const SortableMusicCard: React.FC<SortableMusicCardProps> = ({ deleteSong, song }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: song.id,
    transition: null,
  });

  const style = useMemo<React.CSSProperties>(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition,
    }),
    [transform, transition],
  );

  return (
    <MusicCard
      style={style}
      {...attributes}
      ref={setNodeRef}
      type={song.type}
      artist={song.artist}
      name={song.name}
      // image={song.image} TODO
      leftSlot={
        <IconGripVertical
          aria-label="ドラッグアンドドロップで並び替える"
          size={22}
          cursor="grab"
          style={{
            touchAction: 'none',
          }}
          {...listeners}
        />
      }
      rightSlot={
        <ActionIcon
          radius="50%"
          aria-label="削除する"
          color="red"
          variant="outline"
          onClick={deleteSong(song.id)}
        >
          <IconTrash size={16} />
        </ActionIcon>
      }
    />
  );
};

export default SortableMusicCard;
