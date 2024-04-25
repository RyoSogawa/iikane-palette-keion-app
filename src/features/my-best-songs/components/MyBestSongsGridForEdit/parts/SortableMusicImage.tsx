import React, { useMemo } from 'react';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Image } from '@mantine/core';

import type { SongWithImage } from '@/types/types';

export type SortableMusicImageProps = {
  song: Pick<SongWithImage, 'id' | 'type' | 'name' | 'image'>;
};

const SortableMusicImage: React.FC<SortableMusicImageProps> = ({ song }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: song.id,
  });

  const style = useMemo<React.CSSProperties>(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition,
    }),
    [transform, transition],
  );

  return (
    <div style={style} {...attributes} ref={setNodeRef} {...listeners}>
      <Image
        src={song.image}
        alt={song.name}
        width={78}
        height={78}
        w="100%"
        h="100%"
        loading="lazy"
        bg="gray"
        draggable={false}
        style={{
          userSelect: 'none',
        }}
      />
    </div>
  );
};

export default SortableMusicImage;
