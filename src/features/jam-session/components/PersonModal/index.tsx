import React, { useState } from 'react';

import {
  Alert,
  Anchor,
  Button,
  Group,
  Image,
  Loader,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from '@mantine/core';

import ParticipantAvatar from '@/features/jam-session/components/ParticipantAvatar';
import { displayName, profileSummary } from '@/features/jam-session/components/PresenceSection';
import { songTitle } from '@/features/jam-session/logics/song-title';
import { api } from '@/trpc/react';
import LinkComponent from '@/ui/components/common/LinkComponent';

import type {
  JamSessionParticipantView,
  JamSessionSongView,
  JamSessionViewer,
} from '@/features/jam-session/types';

export type PersonModalProps = {
  person: JamSessionParticipantView | undefined;
  songs: JamSessionSongView[];
  viewer: JamSessionViewer;
  isPending: boolean;
  onClose: () => void;
  onKick: (userId: string) => void;
};

/** アバターをタップして開くポップアップ。その人のパート・ルーツと、My Best Songs のジャケットを敷き詰めて出す */
const PersonModal: React.FC<PersonModalProps> = ({ person, onClose, ...props }) => (
  <Modal
    opened={!!person}
    withCloseButton={false}
    styles={{ body: { paddingTop: 'var(--mantine-spacing-md)' } }}
    onClose={onClose}
  >
    {person && <PersonDetail key={person.userId} person={person} onClose={onClose} {...props} />}
  </Modal>
);

const PersonDetail: React.FC<
  Omit<PersonModalProps, 'person'> & { person: JamSessionParticipantView }
> = ({ person, songs, viewer, isPending, onClose, onKick }) => {
  const name = displayName(person);
  const [confirmingKick, setConfirmingKick] = useState(false);
  const raisedSongs = songs.filter(({ entries }) =>
    entries.some(({ userId }) => userId === person.userId),
  );
  const canKick = viewer.isActive && person.userId !== viewer.userId;

  return (
    <Stack gap="sm">
      <Group wrap="nowrap" gap="sm">
        <ParticipantAvatar name={name} image={person.user.image} size={48} />
        <Stack gap={0} flex={1} miw={0}>
          <Title order={2} fz="lg" c="bright">
            {name}
          </Title>
          <Text fz="sm" c="dimmed">
            {profileSummary(person) || 'パート・ルーツは未登録'}
          </Text>
        </Stack>
        <Modal.CloseButton aria-label="閉じる" onClick={onClose} />
      </Group>

      {raisedSongs.length > 0 && (
        <Text fz="xs" c="dimmed">
          挙手中：{raisedSongs.map(songTitle).join('、')}
        </Text>
      )}

      <MyBestSongTiles userId={person.userId} />

      {canKick &&
        (confirmingKick ? (
          <Alert color="red" variant="light" title={`${name} を退出させますか？`}>
            <Text fz="sm">本人はいつでも参加し直せます。挙手は消えません。</Text>
            <Group mt="sm" grow>
              <Button variant="default" onClick={() => setConfirmingKick(false)}>
                やめる
              </Button>
              <Button color="red" loading={isPending} onClick={() => onKick(person.userId)}>
                退出させる
              </Button>
            </Group>
          </Alert>
        ) : (
          <Stack gap={4}>
            <Button variant="outline" color="red" onClick={() => setConfirmingKick(true)}>
              {name} を退出させる
            </Button>
            <Text fz="xs" c="dimmed">
              退出を忘れて帰った人を外すための操作です。
            </Text>
          </Stack>
        ))}
    </Stack>
  );
};

const MyBestSongTiles: React.FC<{ userId: string }> = ({ userId }) => {
  const { data, isLoading } = api.myBestSongs.findByUserId.useQuery(
    { userId },
    { refetchOnWindowFocus: false },
  );
  const [selectedId, setSelectedId] = useState<string>();

  if (isLoading) return <Loader size="sm" mx="auto" />;
  if (!data || data.length === 0) return null;

  const selected = data.find(({ id }) => id === selectedId);

  return (
    <Stack gap={6}>
      <Group gap="xs" align="baseline">
        <Title order={3} fz="sm" c="bright">
          My Best Songs
        </Title>
        <Text fz="xs" c="dimmed">
          {data.length} 曲
        </Text>
        <Anchor component={LinkComponent} href={`/members/${userId}/profile`} fz="xs" ml="auto">
          プロフィールを見る
        </Anchor>
      </Group>
      <Text fz="xs" c={selected ? 'bright' : 'dimmed'} truncate="end" aria-live="polite">
        {selected
          ? `${selected.name} / ${selected.artist}`
          : 'ジャケットをタップすると曲名が出ます'}
      </Text>
      <SimpleGrid cols={5} spacing={3} mah="45vh" style={{ overflowY: 'auto' }}>
        {data.map((song) => (
          <UnstyledButton
            key={song.id}
            aria-label={`${song.name} / ${song.artist}`}
            aria-pressed={song.id === selectedId}
            onClick={() => setSelectedId(song.id)}
          >
            <Image
              src={song.image}
              alt=""
              radius={3}
              loading="lazy"
              bg="dark.5"
              style={{ aspectRatio: '1 / 1' }}
              fallbackSrc="data:image/gif;base64,R0lGODlhAQABAAAAACw="
            />
          </UnstyledButton>
        ))}
      </SimpleGrid>
    </Stack>
  );
};

export default PersonModal;
