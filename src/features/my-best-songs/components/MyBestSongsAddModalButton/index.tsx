'use client';

import React, { useCallback, useState } from 'react';

import { ActionIcon, Alert, Flex, Loader, Modal, Space } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconCheck, IconInfoCircle, IconPlus } from '@tabler/icons-react';
import { type ItemContent, Virtuoso } from 'react-virtuoso';

import MusicCard from '@/features/my-best-songs/components/MusicCard';
import MusicSearchInput from '@/features/my-best-songs/components/MusicSearchInput';
import { useAddSong } from '@/features/my-best-songs/hooks/useAddSong';
import { useDeleteSong } from '@/features/my-best-songs/hooks/useDeleteSong';
import { useFindSongsByUserId } from '@/features/my-best-songs/hooks/useFindSongsByUserId';
import { useSearchSpotify } from '@/features/my-best-songs/hooks/useSearchSpotify';
import { type RouterOutputs } from '@/trpc/shared';
import { type SongTypeType } from '@/types/generated/zod';
import StickyBottomButton from 'src/components/ui/StickyBottomButton';

import s from './style.module.css';

const FooterSpace = () => <Space h={32} />;

export type MyBestSongsAddModalButtonProps = {
  userId: string;
};

const MyBestSongsAddModalButton: React.FC<MyBestSongsAddModalButtonProps> = ({ userId }) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [searchValue, setSearchValue] = useState('');
  const [searchType, setSearchType] = useState<SongTypeType>('track');
  const { data, isFetching } = useSearchSpotify(searchValue, searchType);
  const { data: currentSongs, isFetching: isFetchingCurrentSongs } = useFindSongsByUserId(userId);
  const { addSong } = useAddSong(userId);
  const { deleteSong } = useDeleteSong(userId);
  const { data: currentData } = useFindSongsByUserId(userId);
  const isOverflowed = currentSongs && currentSongs?.length >= 100;

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
                <ActionIcon
                  radius="50%"
                  aria-label="my best songsに追加"
                  disabled={isOverflowed}
                  onClick={addSong(song)}
                >
                  <IconPlus size={16} />
                </ActionIcon>
              )
            }
          />
        </div>
      );
    },
    [addSong, currentData, deleteSong, isOverflowed],
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
              <MusicSearchInput
                value={searchValue}
                type={searchType}
                onChange={setSearchValue}
                onChangeType={setSearchType}
              />
              {isOverflowed && (
                <Alert
                  mt="md"
                  title="もう十分登録しました。"
                  variant="light"
                  color="red"
                  icon={<IconInfoCircle />}
                >
                  My Best Songsは100曲までです。
                </Alert>
              )}
            </div>
            {isFetching && (
              <Flex align="center" justify="center" pt={120}>
                <Loader />
              </Flex>
            )}
            {searchValue && !isFetching && (
              <Virtuoso
                data={data}
                className={s.musicCardList}
                itemContent={itemContent}
                components={{
                  Footer: FooterSpace,
                }}
              />
            )}
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>
      {!isFetchingCurrentSongs && (
        <StickyBottomButton mt={32} onClick={handleOpen}>
          <IconPlus size={16} />
          <Space w={4} />
          追加
        </StickyBottomButton>
      )}
    </>
  );
};

export default MyBestSongsAddModalButton;
