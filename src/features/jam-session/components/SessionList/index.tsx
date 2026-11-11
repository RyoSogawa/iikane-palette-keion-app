'use client';

import React, { useState } from 'react';

import { Badge, Button, Container, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { IconPlus } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

import { NotificationOptions } from '@/constants/notification';
import SessionFormModal from '@/features/jam-session/components/SessionFormModal';
import { sortSessions } from '@/features/jam-session/logics/session-list';
import { formatHeldOn, fromHeldOn } from '@/server/api/routers/jam-session/held-on';
import { api } from '@/trpc/react';
import LinkComponent from '@/ui/components/common/LinkComponent';

import type { JamSessionListItem } from '@/features/jam-session/types';

export type SessionListProps = {
  initialData: JamSessionListItem[];
  /** サーバーとブラウザで今日がずれないよう、JST の今日はサーバーで決めて渡す */
  today: string;
};

/** セッションの一覧と「セッションを作る」。ログインしていれば誰でも作れる */
const SessionList: React.FC<SessionListProps> = ({ initialData, today }) => {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const { data } = api.jamSession.list.useQuery(undefined, { initialData });
  const utils = api.useUtils();
  const create = api.jamSession.create.useMutation({
    // 一覧に戻ったときに作ったセッションが抜けて見えないよう、キャッシュも取り直しておく
    onSuccess: ({ id }) => {
      void utils.jamSession.list.invalidate();
      router.push(`/jam-session/${id}`);
    },
    onError: () => showNotification(NotificationOptions.error),
  });
  const sessions = sortSessions(data, today);

  return (
    <Container size={480} px={12} py={12}>
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={1} fz="lg">
            セッション
          </Title>
          <Button leftSection={<IconPlus size={16} />} onClick={() => setCreating(true)}>
            セッションを作る
          </Button>
        </Group>

        {sessions.length === 0 && (
          <Text c="dimmed" fz="sm">
            まだセッションがありません。
          </Text>
        )}
        <Stack component="ul" gap={6} m={0} p={0} style={{ listStyle: 'none' }}>
          {sessions.map((session) => {
            const isToday = fromHeldOn(session.heldOn) === today;
            return (
              <li key={session.id}>
                <Paper
                  component={LinkComponent}
                  href={`/jam-session/${session.id}`}
                  display="block"
                  px="sm"
                  py={10}
                  radius="md"
                  bg={isToday ? 'dark.5' : 'dark.6'}
                  style={{ color: 'inherit', textDecoration: 'none' }}
                  withBorder
                >
                  <Group gap="xs" wrap="nowrap">
                    <Text fw={700} c="bright" truncate="end" flex={1} miw={0}>
                      {session.name}
                    </Text>
                    {isToday && (
                      <Badge size="sm" radius="sm" color="grape">
                        今日
                      </Badge>
                    )}
                  </Group>
                  <Text fz="xs" c="dimmed">
                    {formatHeldOn(session.heldOn)} ・ {session._count.songs} 曲
                  </Text>
                </Paper>
              </li>
            );
          })}
        </Stack>
      </Stack>

      <SessionFormModal
        opened={creating}
        title="セッションを作る"
        submitLabel="作る"
        initialValue={{ name: '', heldOn: today }}
        isPending={create.isPending || create.isSuccess}
        onClose={() => setCreating(false)}
        onSubmit={(input) => create.mutate(input)}
      />
    </Container>
  );
};

export default SessionList;
