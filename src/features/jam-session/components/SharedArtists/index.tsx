import React from 'react';

import { Avatar, Group, Stack, Text, Title, UnstyledButton } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';

import { displayName } from '@/features/jam-session/components/PresenceSection';
import { artistKey } from '@/server/api/routers/jam-session/shared-artists';
import { api } from '@/trpc/react';

import type { JamSessionParticipantView } from '@/features/jam-session/types';

// 全員の My Best Songs を読むので、board の 5 秒より間を空けて取り直す
const REFETCH_INTERVAL_MS = 30_000;

export type SharedArtistsProps = {
  participantsById: Map<string, JamSessionParticipantView>;
  listedArtists: Set<string>;
  onSelect: (artist: string) => void;
};

/**
 * 参加中のメンバーの My Best Songs で重なっているアーティスト。タップするとそのアーティストで曲を挙げられる。
 * 「<アーティスト名> の曲なにか」が挙がった後も手がかりとして残し、挙がっている印だけ付ける。
 */
const SharedArtists: React.FC<SharedArtistsProps> = ({
  participantsById,
  listedArtists,
  onSelect,
}) => {
  const { data } = api.jamSession.sharedArtists.useQuery(undefined, {
    refetchInterval: REFETCH_INTERVAL_MS,
  });
  // この query は 30 秒おきなので、その間に退出した人は board の参加者で外し、2 人を切ったら出さない
  const artists = (data ?? [])
    .map(({ artist, userIds }) => ({
      artist,
      isListed: listedArtists.has(artistKey(artist)),
      userIds: userIds.filter((userId) => participantsById.has(userId)),
    }))
    .filter(({ userIds }) => userIds.length >= 2);

  if (artists.length === 0) return null;

  return (
    <Stack component="section" aria-labelledby="shared-artists-title" gap={6}>
      <Title id="shared-artists-title" order={2} fz="sm">
        みんなの My Best Songs で重なっているアーティスト
      </Title>
      <Group gap={6}>
        {artists.map(({ artist, userIds, isListed }) => (
          <UnstyledButton
            key={artist}
            aria-label={`${artist}（${userIds.length} 人${isListed ? '・挙がっています' : ''}）で曲を挙げる`}
            px={10}
            py={4}
            bg="grape.9"
            style={{ borderRadius: 999 }}
            onClick={() => onSelect(artist)}
          >
            <Group gap={6} wrap="nowrap">
              {isListed && <IconCheck size={14} color="white" aria-hidden />}
              <Text fz="xs" fw={700} c="white">
                {artist}
              </Text>
              <Avatar.Group spacing={6}>
                {userIds.map((userId) => {
                  const participant = participantsById.get(userId);
                  const name = participant ? displayName(participant) : '';
                  return (
                    <Avatar
                      key={userId}
                      src={participant?.user.image}
                      alt={name}
                      name={name}
                      color="initials"
                      size={18}
                    />
                  );
                })}
              </Avatar.Group>
            </Group>
          </UnstyledButton>
        ))}
      </Group>
      <Text fz="xs" c="dimmed">
        タップすると「〇〇 の曲なにか」として挙げられます
      </Text>
    </Stack>
  );
};

export default SharedArtists;
