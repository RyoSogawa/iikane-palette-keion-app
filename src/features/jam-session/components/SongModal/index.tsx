import React, { useState } from 'react';

import { Alert, Button, Group, Modal, Paper, SimpleGrid, Stack, Text } from '@mantine/core';

import PartChips from '@/features/jam-session/components/PartChips';
import { memberCount, summarizeParts } from '@/features/jam-session/logics/song-list';
import { songSubtitle, songTitle } from '@/features/jam-session/logics/song-title';
import { setMyPartsInputSchema } from '@/server/api/routers/jam-session/schemas';

import type { JamSessionSongView, JamSessionViewer } from '@/features/jam-session/types';
import type { JamSessionPartType } from '@/types/generated/zod';

export type SongModalProps = {
  song: JamSessionSongView | undefined;
  viewer: JamSessionViewer;
  isPending: boolean;
  onClose: () => void;
  onRequestJoin: () => void;
  onSaveParts: (input: { parts: JamSessionPartType[]; partNote: string }) => void;
  onSetPlayed: (played: boolean) => void;
  onDelete: () => void;
};

/** 曲をタップして開くポップアップ。手を挙げる・パートを変える・演奏済みにする・消す */
const SongModal: React.FC<SongModalProps> = ({ song, onClose, ...props }) => (
  <Modal opened={!!song} title="できるパートを選ぶ" onClose={onClose}>
    {song && <SongForm key={song.id} song={song} {...props} />}
  </Modal>
);

const SongForm: React.FC<Omit<SongModalProps, 'onClose'> & { song: JamSessionSongView }> = ({
  song,
  viewer,
  isPending,
  onRequestJoin,
  onSaveParts,
  onSetPlayed,
  onDelete,
}) => {
  const myEntries = song.entries.filter(({ userId }) => userId === viewer.userId);
  const hasRaisedHand = myEntries.length > 0;
  const [parts, setParts] = useState<JamSessionPartType[]>(
    hasRaisedHand ? myEntries.map(({ part }) => part) : (viewer.profile?.parts ?? []),
  );
  const [partNote, setPartNote] = useState(
    myEntries.find(({ part }) => part === 'other')?.partNote ?? viewer.profile?.partNote ?? '',
  );
  const [partNoteError, setPartNoteError] = useState<string>();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const isPlayed = song.playedAt !== null;
  const canDelete = song.proposerId === viewer.userId || viewer.isAdmin;
  const recruiting = summarizeParts(song.entries)
    .filter(({ userIds }) => userIds.length === 0)
    .map(({ label }) => label);
  const subtitle = songSubtitle(song);

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    const result = setMyPartsInputSchema.safeParse({ songId: song.id, parts, partNote });
    if (!result.success) {
      setPartNoteError(result.error.issues[0]?.message);
      return;
    }
    setPartNoteError(undefined);
    onSaveParts({ parts, partNote });
  };

  return (
    <Stack>
      <Paper bg="dark.7" p="sm" radius="md">
        <Text fw={700} c="bright">
          {songTitle(song)}
        </Text>
        <Text fz="xs" c="dimmed">
          {[
            subtitle,
            `いま ${memberCount(song.entries)} 人`,
            recruiting.length > 0 && `${recruiting.join(' / ')} が募集中`,
          ]
            .filter(Boolean)
            .join(' ・ ')}
        </Text>
      </Paper>

      {viewer.isActive ? (
        <form onSubmit={handleSave}>
          <Stack>
            <PartChips
              legend="パート（複数選べます）"
              value={parts}
              partNote={partNote}
              partNoteError={partNoteError}
              onChange={setParts}
              onChangePartNote={setPartNote}
            />
            <Button type="submit" size="md" loading={isPending}>
              保存する
            </Button>
          </Stack>
        </form>
      ) : (
        <Alert variant="light">
          <Text fz="sm">参加すると、この曲に手を挙げられます。</Text>
          <Button mt="sm" onClick={onRequestJoin}>
            参加する
          </Button>
        </Alert>
      )}

      {viewer.isActive && (
        <SimpleGrid cols={hasRaisedHand ? 2 : 1} spacing="xs">
          <Button
            variant="outline"
            color={isPlayed ? 'gray' : 'green'}
            loading={isPending}
            onClick={() => onSetPlayed(!isPlayed)}
          >
            {isPlayed ? '未演奏に戻す' : '演奏済みにする'}
          </Button>
          {hasRaisedHand && (
            <Button
              variant="subtle"
              color="red"
              loading={isPending}
              onClick={() => onSaveParts({ parts: [], partNote: '' })}
            >
              手を下げる
            </Button>
          )}
        </SimpleGrid>
      )}

      {canDelete &&
        (confirmingDelete ? (
          <Alert color="red" variant="light" title="この曲を消しますか？">
            <Text fz="sm">手を挙げている人の登録もすべて消えます。</Text>
            <Group mt="sm" grow>
              <Button variant="default" onClick={() => setConfirmingDelete(false)}>
                やめる
              </Button>
              <Button color="red" loading={isPending} onClick={onDelete}>
                消す
              </Button>
            </Group>
          </Alert>
        ) : (
          <Button variant="subtle" color="red" onClick={() => setConfirmingDelete(true)}>
            この曲を削除する
          </Button>
        ))}
    </Stack>
  );
};

export default SongModal;
