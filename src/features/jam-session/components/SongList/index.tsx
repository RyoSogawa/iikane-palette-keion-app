import React from 'react';

import {
  Avatar,
  Badge,
  Box,
  Group,
  Paper,
  Stack,
  Text,
  Title,
  VisuallyHidden,
} from '@mantine/core';

import { displayName } from '@/features/jam-session/components/PresenceSection';
import { memberCount, summarizeParts } from '@/features/jam-session/logics/song-list';
import { songSubtitle, songTitle } from '@/features/jam-session/logics/song-title';

import type { JamSessionParticipantView, JamSessionSongView } from '@/features/jam-session/types';

export type SongListProps = {
  songs: JamSessionSongView[];
  participantsById: Map<string, JamSessionParticipantView>;
  viewerId: string;
  onSelectSong: (songId: string) => void;
};

/**
 * やりたい曲の一覧。スマホで多く見えるよう、1 曲を曲名の行とパートの行の 2 行に詰める。
 * 手を挙げている人はアバターで出し、名前は読み上げ用にだけ持つ
 */
const SongList: React.FC<SongListProps> = ({ songs, participantsById, viewerId, onSelectSong }) => (
  <Stack component="section" aria-labelledby="songs-title" gap={6}>
    <Group gap="xs" align="baseline">
      <Title id="songs-title" order={2} fz="sm">
        やりたい曲
      </Title>
      <Text c="dimmed" fz="xs">
        {songs.length} 曲
      </Text>
    </Group>
    {songs.length === 0 && (
      <Text c="dimmed" fz="sm" py="md">
        まだ曲が挙がっていません。下の「やりたい曲を挙げる」から挙げてみましょう。
      </Text>
    )}
    <Stack component="ul" gap={6} m={0} p={0} style={{ listStyle: 'none' }}>
      {songs.map((song) => (
        <li key={song.id}>
          <SongRow
            song={song}
            participantsById={participantsById}
            viewerId={viewerId}
            onClick={() => onSelectSong(song.id)}
          />
        </li>
      ))}
    </Stack>
  </Stack>
);

type SongRowProps = {
  song: JamSessionSongView;
  participantsById: Map<string, JamSessionParticipantView>;
  viewerId: string;
  onClick: () => void;
};

const SongRow: React.FC<SongRowProps> = ({ song, participantsById, viewerId, onClick }) => {
  const title = songTitle(song);
  const subtitle = songSubtitle(song);
  const count = memberCount(song.entries);
  const isPlayed = song.playedAt !== null;
  const hasRaisedHand = song.entries.some(({ userId }) => userId === viewerId);
  const nameOf = (userId: string) => {
    const participant = participantsById.get(userId);
    return participant ? displayName(participant) : '';
  };

  return (
    <Paper
      component="button"
      type="button"
      w="100%"
      px={10}
      py={8}
      radius="md"
      bg={isPlayed ? 'dark.7' : 'dark.6'}
      aria-label={`${title}${subtitle ? ` / ${subtitle}` : ''}、${count} 人`}
      data-testid="jam-session-song"
      style={{ textAlign: 'left', color: 'inherit', font: 'inherit', cursor: 'pointer' }}
      withBorder
      onClick={onClick}
    >
      <Group gap={8} wrap="nowrap">
        <Group gap={8} wrap="nowrap" flex={1} miw={0} align="baseline">
          <Text fz="sm" fw={700} c="bright" truncate="end">
            {title}
          </Text>
          {subtitle && (
            <Text fz={11} c="dimmed" style={{ flexShrink: 0 }} truncate="end" maw="40%">
              {subtitle}
            </Text>
          )}
        </Group>
        {isPlayed && (
          <Badge size="sm" radius="sm" color="green" variant="light" style={{ flexShrink: 0 }}>
            演奏済み
          </Badge>
        )}
        {hasRaisedHand && (
          <Badge size="sm" radius="sm" variant="light" style={{ flexShrink: 0 }}>
            挙手中
          </Badge>
        )}
        <Text fz="md" fw={700} c="bright" style={{ flexShrink: 0 }}>
          {count}
          <Text fz={11} fw={400} c="dimmed" span>
            {' '}
            人
          </Text>
        </Text>
      </Group>
      <Group gap={4} mt={6}>
        {summarizeParts(song.entries).map((summary) =>
          summary.userIds.length > 0 ? (
            <Group
              key={summary.key}
              gap={4}
              pl={6}
              pr={2}
              py={2}
              bg="dark.4"
              wrap="nowrap"
              style={{ borderRadius: 4 }}
            >
              <Text fz={12} fw={700} c="blue.2" span>
                {summary.label}
              </Text>
              <Avatar.Group spacing={4} aria-hidden>
                {summary.userIds.map((userId) => {
                  const participant = participantsById.get(userId);
                  return (
                    <Avatar
                      key={userId}
                      src={participant?.user.image}
                      alt=""
                      name={nameOf(userId)}
                      color="initials"
                      size={18}
                    />
                  );
                })}
              </Avatar.Group>
              <VisuallyHidden> {summary.userIds.map(nameOf).join(' ')}</VisuallyHidden>
            </Group>
          ) : (
            <Box
              key={summary.key}
              px={6}
              fz={12}
              c="dimmed"
              style={{ border: '1px dashed var(--mantine-color-dark-3)', borderRadius: 4 }}
            >
              {summary.label} 募集
            </Box>
          ),
        )}
      </Group>
    </Paper>
  );
};

export default SongList;
