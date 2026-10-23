import React from 'react';

import {
  Anchor,
  Breadcrumbs,
  Button,
  Divider,
  SimpleGrid,
  Stack,
  Text,
  Title,
  Group,
} from '@mantine/core';
import { IconEye } from '@tabler/icons-react';
import { notFound } from 'next/navigation';

import BandForm from '@/features/admin/components/BandForm';
import BandMembersEditor from '@/features/admin/components/BandMembersEditor';
import DeleteBandButton from '@/features/admin/components/DeleteBandButton';
import EventImageInput from '@/features/admin/components/EventImageInput';
import { api } from '@/trpc/server';
import LinkComponent from '@/ui/components/common/LinkComponent';

type Props = {
  params: Promise<{ eventId: string; bandId: string }>;
};

export default async function AdminBandPage({ params }: Props) {
  const { eventId, bandId } = await params;
  const trpc = await api();
  const [event, users] = await Promise.all([
    trpc.admin.event.findById({ id: eventId }),
    trpc.admin.user.getAll(),
  ]);
  const band = event?.Band.find((b) => b.id === bandId);
  if (!event || !band) {
    notFound();
  }

  return (
    <>
      <Breadcrumbs fz="xs">
        <Anchor component={LinkComponent} href="/admin/events" fz="xs">
          イベント管理
        </Anchor>
        <Anchor component={LinkComponent} href={`/admin/events/${event.id}`} fz="xs">
          {event.name}
        </Anchor>
        <Text fz="xs">{band.name}</Text>
      </Breadcrumbs>
      <Group justify="space-between" mt="lg">
        <Title size="h2">
          No.{band.liveOrder} {band.name}
        </Title>
        <Button
          component={LinkComponent}
          href={`/admin/events/${event.id}/preview/bands/${band.id}`}
          variant="default"
          leftSection={<IconEye size={16} />}
        >
          プレビュー
        </Button>
      </Group>

      <Stack gap="xl" mt="xl">
        <section>
          <Title order={2} size="h3" mb="md">
            基本情報
          </Title>
          <BandForm
            band={{
              id: band.id,
              name: band.name,
              description: band.description,
              movie: band.movie,
            }}
          />
        </section>
        <Divider />
        <section>
          <Title order={2} size="h3" mb="md">
            画像
          </Title>
          <SimpleGrid cols={{ base: 1, sm: 3 }}>
            <EventImageInput
              label="写真"
              target={{ kind: 'bandPhoto', eventId: event.id, bandId: band.id }}
              src={band.photo}
            />
            <EventImageInput
              label="アイコン画像"
              target={{ kind: 'bandImage', eventId: event.id, bandId: band.id }}
              src={band.image}
            />
            <EventImageInput
              label="タイポ画像"
              target={{ kind: 'bandTypoImage', eventId: event.id, bandId: band.id }}
              src={band.typoImage}
            />
          </SimpleGrid>
        </section>
        <Divider />
        <section>
          <Title order={2} size="h3" mb="md">
            メンバー
          </Title>
          <BandMembersEditor
            bandId={band.id}
            members={band.members.map((member) => ({
              userId: member.user?.id ?? null,
              userName: member.userName,
              part: member.part,
            }))}
            users={users}
          />
        </section>
        <Divider />
        <Group justify="center">
          <DeleteBandButton eventId={event.id} band={{ id: band.id, name: band.name }} />
        </Group>
      </Stack>
    </>
  );
}
