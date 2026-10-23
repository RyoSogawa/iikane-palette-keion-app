import React from 'react';

import {
  Anchor,
  Badge,
  Breadcrumbs,
  Button,
  Divider,
  Group,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { IconEye } from '@tabler/icons-react';
import { notFound } from 'next/navigation';

import BandSortableList from '@/features/admin/components/BandSortableList';
import DeleteEventButton from '@/features/admin/components/DeleteEventButton';
import EventForm from '@/features/admin/components/EventForm';
import EventImageInput from '@/features/admin/components/EventImageInput';
import PublishToggle from '@/features/admin/components/PublishToggle';
import RecreationKingSelect from '@/features/admin/components/RecreationKingSelect';
import { formatJst } from '@/features/admin/logics/datetime-local';
import { api } from '@/trpc/server';
import LinkComponent from '@/ui/components/common/LinkComponent';

type Props = {
  params: Promise<{ eventId: string }>;
};

export default async function AdminEventPage({ params }: Props) {
  const { eventId } = await params;
  const trpc = await api();
  const [event, users] = await Promise.all([
    trpc.admin.event.findById({ id: eventId }),
    trpc.admin.user.getAll(),
  ]);
  if (!event) {
    notFound();
  }

  return (
    <>
      <Breadcrumbs fz="xs">
        <Anchor component={LinkComponent} href="/admin/events" fz="xs">
          イベント管理
        </Anchor>
        <Text fz="xs">{event.name}</Text>
      </Breadcrumbs>
      <Group justify="space-between" mt="lg">
        <Group gap="sm">
          <Badge variant="light" color={event.isDraft ? 'gray' : 'blue'}>
            {event.isDraft ? '下書き' : '公開中'}
          </Badge>
          <Title size="h2">{event.name}</Title>
        </Group>
        <Group gap="sm">
          <Button
            component={LinkComponent}
            href={`/admin/events/${event.id}/preview`}
            variant="default"
            leftSection={<IconEye size={16} />}
          >
            プレビュー
          </Button>
          <PublishToggle eventId={event.id} isDraft={event.isDraft} />
        </Group>
      </Group>
      <Text size="xs" c="dimmed" mt={4}>
        作成: {formatJst(event.createdAt)} / 更新: {formatJst(event.updatedAt)}
      </Text>

      <Stack gap="xl" mt="xl">
        <section>
          <Title order={2} size="h3" mb="md">
            基本情報
          </Title>
          <EventForm
            event={{
              id: event.id,
              name: event.name,
              description: event.description,
              dateFrom: event.dateFrom,
              dateTo: event.dateTo,
              movie: event.movie,
              driveLink: event.driveLink,
            }}
          />
        </section>
        <Divider />
        <section>
          <Title order={2} size="h3" mb="md">
            画像
          </Title>
          <EventImageInput
            label="イベント画像"
            target={{ kind: 'event', eventId: event.id }}
            src={event.image}
          />
        </section>
        <Divider />
        <section>
          <Title order={2} size="h3" mb="md">
            出演バンド
          </Title>
          <BandSortableList
            eventId={event.id}
            bands={event.Band.map((band) => ({
              id: band.id,
              name: band.name,
              memberCount: band.members.length,
            }))}
          />
        </section>
        <Divider />
        <section>
          <Title order={2} size="h3" mb="md">
            レクリエーション王
          </Title>
          <RecreationKingSelect
            eventId={event.id}
            userIds={event.recreationKingUsers.map(({ user }) => user.id)}
            users={users}
          />
        </section>
        <Divider />
        <Group justify="center">
          <DeleteEventButton event={{ id: event.id, name: event.name }} />
        </Group>
      </Stack>
    </>
  );
}
