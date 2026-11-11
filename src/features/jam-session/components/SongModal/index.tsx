import React, { useState } from 'react';

import { Alert, Button, Group, Modal, Paper, Stack, Text } from '@mantine/core';
import { IconCheck, IconExternalLink } from '@tabler/icons-react';

import ConfirmDialog from '@/features/jam-session/components/ConfirmDialog';
import PartChips from '@/features/jam-session/components/PartChips';
import { songSearchUrl } from '@/features/jam-session/logics/search-links';
import { memberCount, summarizeParts } from '@/features/jam-session/logics/song-list';
import { songSubtitle, songTitle } from '@/features/jam-session/logics/song-title';
import { setMyPartsInputSchema } from '@/server/api/routers/jam-session/schemas';

import type { JamSessionSongView, JamSessionViewer } from '@/features/jam-session/types';
import type { JamSessionPartType } from '@/types/generated/zod';

type PartsInput = { parts: JamSessionPartType[]; partNote: string };

export type SongModalProps = {
  song: JamSessionSongView | undefined;
  viewer: JamSessionViewer;
  isPending: boolean;
  onClose: () => void;
  onRequestJoin: () => void;
  onSaveParts: (input: PartsInput) => void;
  onToggleHand: (input: PartsInput) => void;
  onSetPlayed: (played: boolean) => void;
  onDelete: () => void;
};

/** 曲をタップして開くポップアップ。手を挙げる・パートを変える・演奏済みにする・消す */
const SongModal: React.FC<SongModalProps> = ({ song, onClose, ...props }) => (
  <Modal.Root opened={!!song} onClose={onClose}>
    <Modal.Overlay />
    <Modal.Content>
      {song && <SongForm key={song.id} song={song} onClose={onClose} {...props} />}
    </Modal.Content>
  </Modal.Root>
);

type ToggleProps = {
  label: string;
  pressed: boolean;
  color: string;
  disabled?: boolean;
  isPending: boolean;
  onClick: () => void;
};

/** 押すたびに切り替わるボタン。押されているときは塗りとチェックで示し、切り替えで動かないようにする */
const ToggleButton: React.FC<ToggleProps> = ({
  label,
  pressed,
  color,
  disabled = false,
  isPending,
  onClick,
}) => (
  <Button
    size="compact-sm"
    color={color}
    variant={pressed ? 'filled' : 'default'}
    aria-pressed={pressed}
    disabled={disabled || isPending}
    // ローディングの回転・押したときの沈み込み・✓ の出し入れによる幅の変化で動いて見えるので、どれも止める
    leftSection={
      <IconCheck size={14} style={{ visibility: pressed ? 'visible' : 'hidden' }} aria-hidden />
    }
    style={{ transform: 'none', transition: 'none' }}
    onClick={onClick}
  >
    {label}
  </Button>
);

const SongForm: React.FC<SongModalProps & { song: JamSessionSongView }> = ({
  song,
  viewer,
  isPending,
  onClose,
  onRequestJoin,
  onSaveParts,
  onToggleHand,
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

  const validParts = () => {
    const result = setMyPartsInputSchema.safeParse({ songId: song.id, parts, partNote });
    setPartNoteError(result.success ? undefined : result.error.issues[0]?.message);
    return result.success;
  };

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    if (validParts()) onSaveParts({ parts, partNote });
  };

  const handleToggleHand = () => {
    if (hasRaisedHand) {
      onToggleHand({ parts: [], partNote: '' });
    } else if (validParts()) {
      onToggleHand({ parts, partNote });
    }
  };

  return (
    <>
      <Modal.Header>
        <Modal.Title fw={700} style={{ whiteSpace: 'nowrap' }}>
          パートを選ぶ
        </Modal.Title>
        <Group gap={6} wrap="nowrap" ml="auto" mr={4} pl="xs">
          {viewer.isActive && (
            <>
              <ToggleButton
                label="挙手"
                pressed={hasRaisedHand}
                color="blue"
                disabled={!hasRaisedHand && parts.length === 0}
                isPending={isPending}
                onClick={handleToggleHand}
              />
              <ToggleButton
                label="演奏済み"
                pressed={isPlayed}
                color="green"
                isPending={isPending}
                onClick={() => onSetPlayed(!isPlayed)}
              />
            </>
          )}
        </Group>
        <Modal.CloseButton aria-label="閉じる" onClick={onClose} />
      </Modal.Header>
      <Modal.Body>
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
            <Group gap="xs" mt="xs" grow>
              <Button
                component="a"
                href={songSearchUrl(song, 'chord')}
                target="_blank"
                rel="noopener noreferrer"
                variant="light"
                size="xs"
                rightSection={<IconExternalLink size={14} />}
              >
                コード譜を探す
              </Button>
              <Button
                component="a"
                href={songSearchUrl(song, 'lyrics')}
                target="_blank"
                rel="noopener noreferrer"
                variant="light"
                size="xs"
                rightSection={<IconExternalLink size={14} />}
              >
                歌詞を探す
              </Button>
            </Group>
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

          {canDelete && (
            <Button variant="subtle" color="red" onClick={() => setConfirmingDelete(true)}>
              この曲を削除する
            </Button>
          )}
        </Stack>
      </Modal.Body>

      <ConfirmDialog
        opened={confirmingDelete}
        title="この曲を消しますか？"
        message={`「${songTitle(song)}」と、手を挙げている人の登録がすべて消えます。`}
        confirmLabel="消す"
        isPending={isPending}
        onConfirm={onDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </>
  );
};

export default SongModal;
