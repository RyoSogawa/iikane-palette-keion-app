import React, { useMemo } from 'react';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Image, ThemeIcon } from '@mantine/core';
import { IconGripVertical } from '@tabler/icons-react';

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
      position: 'relative',
      transform: CSS.Transform.toString(transform),
      transition,
      userSelect: 'none',
    }),
    [transform, transition],
  );

  return (
    <div style={style} {...attributes} ref={setNodeRef}>
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
      />
      <ThemeIcon
        pos="absolute"
        style={{
          touchAction: 'none',
          cursor: 'grab',
          zIndex: 1,
          top: 10,
          left: 10,
        }}
        variant="outline"
        color="gray"
        bg="dark"
        {...listeners}
      >
        <IconGripVertical aria-label="ドラッグアンドドロップで並び替える" size={22} />
      </ThemeIcon>
    </div>
  );
};

export default SortableMusicImage;
