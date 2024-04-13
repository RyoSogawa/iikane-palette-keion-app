'use client';

import React, { useCallback, useState } from 'react';

import { ActionIcon, Button, Flex, Loader, Modal, Space } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconCheck, IconPlus } from '@tabler/icons-react';
import { type ItemContent, Virtuoso } from 'react-virtuoso';

import MusicCard from '@/features/my-best-songs/components/MusicCard';
import MusicSearchInput from '@/features/my-best-songs/components/MusicSearchInput';
import { useAddSong } from '@/features/my-best-songs/hooks/useAddSong';
import { useDeleteSong } from '@/features/my-best-songs/hooks/useDeleteSong';
import { useFindSongsByUserId } from '@/features/my-best-songs/hooks/useFindSongsByUserId';
import { useSearchSpotify } from '@/features/my-best-songs/hooks/useSearchSpotify';
import { type RouterOutputs } from '@/trpc/shared';

import s from './style.module.css';

export type MyBestSongsAddModalButtonProps = {
  userId: string;
};

const MyBestSongsAddModalButton: React.FC<MyBestSongsAddModalButtonProps> = ({ userId }) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [searchValue, setSearchValue] = useState('');
  const { data, isFetching } = useSearchSpotify(searchValue);
  const { addSong } = useAddSong(userId);
  const { deleteSong } = useDeleteSong(userId);
  const { data: currentData } = useFindSongsByUserId(userId);

  const handleOpen = useCallback(() => {
    setSearchValue('');
    open();
  }, [open]);

  const itemContent = useCallback<
    ItemContent<RouterOutputs['myBestSongs']['search'][number], unknown>
  >(
    (_index, song) => {
      const existingData = currentData?.find(
        (currentSong) => currentSong.spotifyId === song.spotifyId,
      );
      return (
        <div key={song.spotifyId} className={s.modalBodySpace}>
          <MusicCard
            type={song.type}
            artist={song.artist}
            name={song.name}
            image={song.image}
            rightSlot={
              existingData ? (
                <ActionIcon
                  radius="50%"
                  aria-label="削除"
                  color="green"
                  variant="outline"
                  onClick={deleteSong(existingData.id)}
                >
                  <IconCheck size={16} />
                </ActionIcon>
              ) : (
                <ActionIcon radius="50%" aria-label="my best songsに追加" onClick={addSong(song)}>
                  <IconPlus size={16} />
                </ActionIcon>
              )
            }
          />
        </div>
      );
    },
    [addSong, currentData, deleteSong],
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
