'use client';

import React, { useState } from 'react';

import MusicInfoModal from '@/features/my-best-songs/components/MusicInfoModal';
import { useMusicModal } from '@/features/my-best-songs/components/MyBestSongs/logics';
import MyBestSongsGrid from '@/features/my-best-songs/components/MyBestSongsGrid';
import MyBestSongsList from '@/features/my-best-songs/components/MyBestSongsList';
import ListTypeSwitcher, { type ListType } from '@/ui/components/input/ListTypeSwitcher';

import type { SongWithImage } from '@/types/types';

export type MyBestsSongsProps = {
  data: SongWithImage[];
};

const MyBestsSongs: React.FC<MyBestsSongsProps> = ({ data }) => {
  const [listType, setListType] = useState<ListType>('grid');
  const {
    isOpen,
    openedSong,
    handleClose,
    handleOpen,
    openNext,
    openPrev,
    nextSongExists,
    prevSongExists,
  } = useMusicModal(data);

  return (
    <div>
      {listType === 'grid' ? (
        <MyBestSongsGrid data={data} onClick={handleOpen} />
      ) : (
        <MyBestSongsList data={data} onClick={handleOpen} />
      )}
      <ListTypeSwitcher mt={24} currentType={listType} onChange={setListType} />
      <MusicInfoModal
        opened={isOpen}
        song={openedSong}
        openNext={openNext}
        openPrev={openPrev}
        nextSongExists={nextSongExists}
        prevSongExists={prevSongExists}
        onClose={handleClose}
      />
    </div>
  );
};

export default MyBestsSongs;
