'use client';

import React, { useCallback, useState } from 'react';

import { ActionIcon, Button, Flex, Loader, Modal, Space } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus } from '@tabler/icons-react';
import { type ItemContent, Virtuoso } from 'react-virtuoso';

import MusicCard from '@/components/model/MusicCard';
import MusicSearchInput from '@/components/model/MusicSearchInput';
import { useAddSong, useSearchSongs } from '@/components/model/MyBestSongsAddModalButton/logics';
import { type RouterOutputs } from '@/trpc/shared';

import s from './style.module.css';

export type MyBestSongsAddModalButtonProps = {
  userId: string;
};

const MyBestSongsAddModalButton: React.FC<MyBestSongsAddModalButtonProps> = ({ userId }) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [searchValue, setSearchValue] = useState('');
  const { data, isFetching } = useSearchSongs(searchValue);
  const { addSong } = useAddSong(userId);

  const handleOpen = useCallback(() => {
    setSearchValue('');
    open();
  }, [open]);

  const itemContent = useCallback<
    ItemContent<RouterOutputs['myBestSongs']['search'][number], unknown>
  >(
    (_index, song) =>
      song && (
        <div key={song.spotifyId} className={s.modalBodySpace}>
          <MusicCard
            type={song.type}
            artist={song.artist}
            name={song.name}
            image={song.image}
            rightSlot={
              <ActionIcon radius="50%" aria-label="my best songsに追加" onClick={addSong(song)}>
                <IconPlus size={16} />
              </ActionIcon>
            }
          />
        </div>
      ),
    [addSong],
  );

  return (
    <>
      <Modal.Root opened={opened} size="lg" onClose={close}>
        <Modal.Overlay />
        <Modal.Content className={s.modalContent}>
          <Modal.Header>
            <Modal.Title>My Best Songs登録</Modal.Title>
            <Modal.CloseButton />
          </Modal.Header>
          <Modal.Body className={s.modalBody}>
            <div className={s.modalBodySpace}>
              <MusicSearchInput value={searchValue} onChange={setSearchValue} />
            </div>
            {isFetching && (
              <Flex align="center" justify="center" pt={120}>
                <Loader />
              </Flex>
            )}
            {searchValue && !isFetching && (
              <Virtuoso data={data} className={s.musicCardList} itemContent={itemContent} />
            )}
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>
      <Button onClick={handleOpen}>
        <IconPlus size={16} />
        <Space w={2} />
        追加
      </Button>
    </>
  );
};

export default MyBestSongsAddModalButton;
