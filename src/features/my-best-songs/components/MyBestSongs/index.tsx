'use client';

import React, { useState } from 'react';

import ListTypeSwitcher, { type ListType } from '@/components/ui/ListTypeSwitcher';
import MyBestSongsGrid from '@/features/my-best-songs/components/MyBestSongsGrid';
import MyBestSongsList from '@/features/my-best-songs/components/MyBestSongsList';

import type { SongWithImage } from '@/types/types';

export type MyBestsSongsProps = {
  data: SongWithImage[];
};

const MyBestsSongs: React.FC<MyBestsSongsProps> = ({ data }) => {
  const [listType, setListType] = useState<ListType>('list');

  return (
    <div>
      {listType === 'grid' ? <MyBestSongsGrid data={data} /> : <MyBestSongsList data={data} />}
      <ListTypeSwitcher mt={24} currentType={listType} onChange={setListType} />
    </div>
  );
};

export default MyBestsSongs;
