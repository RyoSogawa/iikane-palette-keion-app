import React, { useState } from 'react';

import {
  Anchor,
  Button,
  Group,
  Image,
  Loader,
  Modal,
  ScrollArea,
  Stack,
  Text,
  Title,
} from '@mantine/core';

import ConfirmDialog from '@/features/jam-session/components/ConfirmDialog';
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

/** アバターをタップして開くポップアップ。その人のパート・ルーツと、My Best Songs を一覧で読める形で出す */
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

      <MyBestSongList userId={person.userId} />

      {canKick && (
        <Stack gap={4}>
          <Button variant="outline" color="red" onClick={() => setConfirmingKick(true)}>
            {name} を退出させる
          </Button>
          <Text fz="xs" c="dimmed">
            退出を忘れて帰った人を外すための操作です。
          </Text>
        </Stack>
      )}

      <ConfirmDialog
        opened={confirmingKick}
        title={`${name} を退出させますか？`}
        message="本人はいつでも参加し直せます。挙手は消えません。"
        confirmLabel="退出させる"
        isPending={isPending}
        onConfirm={() => onKick(person.userId)}
        onCancel={() => setConfirmingKick(false)}
      />
    </Stack>
  );
};

const MyBestSongList: React.FC<{ userId: string }> = ({ userId }) => {
  const { data, isLoading } = api.myBestSongs.findByUserId.useQuery(
    { userId },
    { refetchOnWindowFocus: false },
  );

  if (isLoading) return <Loader size="sm" mx="auto" />;
  if (!data || data.length === 0) return null;

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
      <ScrollArea.Autosize mah="45vh">
        <Stack component="ul" gap={4} m={0} p={0} style={{ listStyle: 'none' }}>
          {data.map((song) => (
            <Group key={song.id} component="li" gap={8} wrap="nowrap">
              <Image
                src={song.image}
                alt=""
                w={32}
                h={32}
                radius={3}
                loading="lazy"
                bg="dark.5"
                fallbackSrc="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
                style={{ flexShrink: 0 }}
              />
              <Text fz="sm" c="bright" truncate="end" miw={0}>
                {song.name}
                <Text fz="xs" c="dimmed" span>
                  {' '}
                  {song.artist}
                </Text>
              </Text>
            </Group>
          ))}
        </Stack>
      </ScrollArea.Autosize>
    </Stack>
  );
};

export default PersonModal;
