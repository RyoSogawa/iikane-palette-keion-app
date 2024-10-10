import React from 'react';

import { AspectRatio, Breadcrumbs, Container, Image, SimpleGrid, Text, Title } from '@mantine/core';
import { IconHome } from '@tabler/icons-react';
import { format } from 'date-fns';
import Link from 'next/link';

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
      <Breadcrumbs>
        <Link href="/">
          <IconHome size={16} />
        </Link>
        <Link href="/events">イベント</Link>
        <Text>{event.name}</Text>
      </Breadcrumbs>
      <Text c="dimmed" mt="xl">
        {format(new Date(event.dateFrom), 'yyyy/MM/dd')} -{' '}
        {format(new Date(event.dateTo), 'yyyy/MM/dd')}
      </Text>
      <Title mt="xs">{event.name}</Title>
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
      <Title order={2} mt={80}>
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
      <Title order={2} mt={80}>
        👑レク王の方々👑
      </Title>
      🚧 準備中 🚧
      {event.movie && (
        <div>
          <Title order={2} mt={80}>
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
    </Container>
  );
}
