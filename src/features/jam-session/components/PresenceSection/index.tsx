import React, { useMemo, useState } from 'react';

import { Alert, Button, Group, Paper, SegmentedControl, Stack, Text, Title } from '@mantine/core';

import ParticipantAvatar from '@/features/jam-session/components/ParticipantAvatar';
import { partLabel, sortParts } from '@/features/jam-session/logics/parts';
import { groupByPart, groupByRoots } from '@/features/jam-session/logics/presence-groups';

import type { JamSessionParticipantView, JamSessionViewer } from '@/features/jam-session/types';

type GroupBy = 'part' | 'roots';

const GROUP_BY_OPTIONS: Array<{ value: GroupBy; label: string }> = [
  { value: 'part', label: 'パート' },
  { value: 'roots', label: 'ルーツ' },
];

export const displayName = (participant: Pick<JamSessionParticipantView, 'user'>) =>
  participant.user.name ?? '名前なし';

export const profileSummary = ({
  parts,
  partNote,
  roots,
}: {
  parts: JamSessionParticipantView['parts'];
  partNote: string | null;
  roots: string[];
}) => {
  const partText = sortParts(parts)
    .map((part) => partLabel(part, partNote))
    .join(' ');
  return [partText, roots.join(' / ')].filter(Boolean).join(' ・ ');
};

export type PresenceSectionProps = {
  participants: JamSessionParticipantView[];
  viewer: JamSessionViewer;
  onSelectPerson: (userId: string) => void;
  onOpenProfile: () => void;
  onLeave: () => void;
  isPending: boolean;
};

/**
 * 「いまここにいる人」。アバターだけをパートかルーツごとに横に並べ、名前はタップして見る。
 * 自分のパートとルーツの変更は、自分のアバターを開いたポップアップから行う
 */
const PresenceSection: React.FC<PresenceSectionProps> = ({
  participants,
  viewer,
  onSelectPerson,
  onOpenProfile,
  onLeave,
  isPending,
}) => {
  const [groupBy, setGroupBy] = useState<GroupBy>('part');
  const groups = useMemo(
    () => (groupBy === 'part' ? groupByPart(participants) : groupByRoots(participants)),
    [groupBy, participants],
  );

  return (
    <Stack component="section" aria-labelledby="presence-title" gap="xs">
      <Group gap="xs" wrap="nowrap">
        <Title id="presence-title" order={2} fz="sm">
          いまここにいる人
        </Title>
        <Text c="dimmed" fz="xs">
          {participants.length} 人
        </Text>
        {viewer.isActive && (
          <Button
            variant="subtle"
            color="red"
            size="compact-xs"
            loading={isPending}
            onClick={onLeave}
          >
            退出する
          </Button>
        )}
        <SegmentedControl
          ml="auto"
          size="xs"
          aria-label="まとめ方"
          data={GROUP_BY_OPTIONS}
          value={groupBy}
          onChange={(value) => setGroupBy(value === 'roots' ? 'roots' : 'part')}
        />
      </Group>

      {!viewer.isActive && (
        <Alert variant="light" p="sm">
          <Group wrap="nowrap" gap="sm">
            <Text fz="sm" flex={1}>
              まだ参加していません。参加すると、ここに表示されて曲に手を挙げられます。
            </Text>
            <Button onClick={onOpenProfile}>参加する</Button>
          </Group>
        </Alert>
      )}

      {groups.length === 0 ? (
        <Text c="dimmed" fz="sm">
          ルーツを登録している人はまだいません
        </Text>
      ) : (
        <Group gap="6px 6px" data-testid="presence-groups">
          {groups.map((group) => (
            <Paper
              key={group.key}
              bg="dark.6"
              radius="xl"
              py={4}
              pl={10}
              pr={group.members.length > 0 ? 4 : 10}
              role="group"
              aria-label={group.label}
            >
              <Group gap={6} wrap="nowrap">
                <Text fz="xs" fw={700}>
                  {group.label}
                </Text>
                {group.members.length === 0 ? (
                  <Text c="dimmed" fz="xs">
                    いない
                  </Text>
                ) : (
                  <Group gap={3} wrap="nowrap">
                    {group.members.map((member) => (
                      <ParticipantAvatar
                        key={member.userId}
                        name={displayName(member)}
                        image={member.user.image}
                        isMe={member.userId === viewer.userId}
                        onClick={() => onSelectPerson(member.userId)}
                      />
                    ))}
                  </Group>
                )}
              </Group>
            </Paper>
          ))}
        </Group>
      )}
    </Stack>
  );
};

export default PresenceSection;
