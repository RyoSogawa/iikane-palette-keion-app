import React from 'react';

import {
  Text,
  AspectRatio,
  Breadcrumbs,
  Container,
  Image,
  Title,
  Box,
  Avatar,
  Stack,
  Group,
} from '@mantine/core';
import { IconHome } from '@tabler/icons-react';
import Link from 'next/link';

import { api } from '@/trpc/server';

export const revalidate = 3600;

type Props = {
  params: {
    eventId: string;
    bandId: string;
  };
};

export default async function BandPage({ params }: Props) {
  const [event] = await Promise.all([
    api.event.findById.query({
      id: params.eventId,
    }),
  ]);

  if (!event) {
    throw new Error('イベントが見つかりませんでした');
  }

  const band = event.Band.find((b) => b.id === params.bandId);
  if (!band) {
    throw new Error('バンドが見つかりませんでした');
  }

  return (
    <Container py={16}>
      <Breadcrumbs>
        <Link href="/">
          <IconHome size={16} />
        </Link>
        <Link href="/events">イベント</Link>
        <Link href={`/events/${params.eventId}`}>{event.name}</Link>
        <Text>{band.name}</Text>
      </Breadcrumbs>
      <Title size="h2" mt="xl">
        No.{band.liveOrder} :「{band.name}」
      </Title>
      <Box pos="relative">
        <Image
          src={band.photo}
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
        {band.image && (
          <Image
            src={band.image}
            alt=""
            pos="absolute"
            bottom={0}
            left={0}
            w={{ base: 30, md: 50 }}
            h={{ base: 30, md: 50 }}
            fit="cover"
          />
        )}
        {band.typoImage && (
          <Image
            src={band.typoImage}
            alt={band.name}
            pos="absolute"
            bottom={0}
            left={band.image ? { base: 30, md: 50 } : 0}
            w="auto"
            h={{ base: 30, md: 50 }}
            fit="cover"
          />
        )}
      </Box>
      <Title order={2} size="h3" mt="xl">
        メンバー
      </Title>
      <Stack mt="md">
        {band.UserOnBand.map(({ user }) => (
          <Link key={user.id} href={`/members/${user.id}/profile`}>
            <Group>
              <Avatar
                src={user.image}
                alt={user.name ?? ''}
                imageProps={{ loading: 'lazy' }}
                bg="gray"
              />
              <Text c="bright">{user.name}</Text>
            </Group>
          </Link>
        ))}
      </Stack>
      {band.movie && (
        <div>
          <Title order={2} size="h3" mt="xl">
            ライブの様子
          </Title>
          <AspectRatio ratio={16 / 9} mt="md" bg="gray">
            <iframe
              width="560"
              height="315"
              src={band.movie}
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
