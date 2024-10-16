import React from 'react';

import {
  AspectRatio,
  Avatar,
  Breadcrumbs,
  Container,
  Group,
  Image,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { IconHome } from '@tabler/icons-react';
import { format } from 'date-fns';
import Link from 'next/link';

import RecreationKingBadge from '@/features/event/components/RecreationKingBadge';
import { api } from '@/trpc/server';

export const revalidate = 3600;

type Props = {
  params: {
    eventId: string;
  };
};

export default async function EventPage({ params }: Props) {
  const [event] = await Promise.all([
    api.event.findById.query({
      id: params.eventId,
    }),
  ]);

  if (!event) {
    throw new Error('イベントが見つかりませんでした');
  }

  return (
    <Container py={16}>
      <Breadcrumbs fz="xs">
        <Link href="/">
          <IconHome size={16} />
        </Link>
        <Link href="/events">イベント</Link>
        <Text fz="xs">{event.name}</Text>
      </Breadcrumbs>
      <Text c="dimmed" mt="xl">
        {format(new Date(event.dateFrom), 'yyyy/MM/dd')} -{' '}
        {format(new Date(event.dateTo), 'yyyy/MM/dd')}
      </Text>
      <Title size="h2" mt="xs">
        {event.name}
      </Title>
      <Image
        src={event.image}
        alt=""
        mt="md"
        loading="lazy"
        width={393}
        height={262}
        w="100%"
        h="auto"
        fit="cover"
        bg="gray"
      />
      <Title order={2} size="h3" mt="xl">
        出演バンド
      </Title>
      <SimpleGrid cols={{ base: 3, sm: 6 }} mt="lg" spacing="lg">
        {event.Band.map((band) => (
          <Link key={band.id} href={`/events/${event.id}/bands/${band.id}`}>
            <AspectRatio ratio={1}>
              <Image src={band.image! || band.photo} alt="" fit="cover" bg="gray" />
            </AspectRatio>
            <Image src={band.typoImage} alt={band.name} fit="cover" bg="gray" />
          </Link>
        ))}
      </SimpleGrid>
      {event.recreationKingUsers.length && (
        <div>
          <Title order={2} size="h3" mt="xl">
            レク王の方々
          </Title>
          <Stack mt="md">
            {event.recreationKingUsers.map(({ user }) => (
              <Link key={user.id} href={`/members/${user.id}/profile`}>
                <Group>
                  <Avatar
                    src={user.image}
                    alt={user.name ?? ''}
                    imageProps={{ loading: 'lazy' }}
                    bg="gray"
                  />
                  <Text c="bright">
                    {user.name}
                    <RecreationKingBadge
                      kingCount={user.recreationKingEvents.length}
                      size={16}
                      ml={8}
                      mt={-2}
                      style={{
                        verticalAlign: 'middle',
                      }}
                    />
                  </Text>
                </Group>
              </Link>
            ))}
          </Stack>
        </div>
      )}
      {event.movie && (
        <div>
          <Title order={2} size="h3" mt="xl">
            ダイジェスト動画
          </Title>
          <AspectRatio ratio={16 / 9} mt="md" bg="gray">
            <iframe
              width="560"
              height="315"
              src={event.movie}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              loading="lazy"
              allowFullScreen
            />
          </AspectRatio>
        </div>
      )}
      {event.description && (
        <Text mt="lg" style={{ whiteSpace: 'pre-wrap' }}>
          {event.description}
        </Text>
      )}
    </Container>
  );
}
