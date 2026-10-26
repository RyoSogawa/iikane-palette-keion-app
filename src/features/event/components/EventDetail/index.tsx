import React from 'react';

import { AspectRatio, Avatar, Group, Image, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import Link from 'next/link';

import EventStatusBadge from '@/features/event/components/EventStatusBadge';
import RecreationKingBadge from '@/features/event/components/RecreationKingBadge';
import { formatDateString } from '@/utils/date';

import type { EventDetailPayload } from '@/server/api/routers/event/event-detail-select';

export type EventDetailProps = {
  event: EventDetailPayload;
  /** 公開ページとプレビューでリンク先が違うので、バンドページの URL は呼び出し側が決める */
  bandHref: (bandId: string) => string;
};

/**
 * イベント詳細ページの本体。公開ページと管理画面のプレビューで共有する。
 */
const EventDetail: React.FC<EventDetailProps> = ({ event, bandHref }) => {
  return (
    <>
      <EventStatusBadge eventStatus="archive" mt="lg" />
      <Text c="dimmed" mt={4}>
        {formatDateString(event.dateFrom)} - {formatDateString(event.dateTo)}
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
          <Link key={band.id} href={bandHref(band.id)}>
            <AspectRatio ratio={1}>
              <Image src={band.image! || band.photo} alt="" fit="cover" bg="gray" />
            </AspectRatio>
            <Image src={band.typoImage} alt={band.name} fit="cover" bg="gray" />
          </Link>
        ))}
      </SimpleGrid>
      {event.recreationKingUsers.length > 0 && (
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
    </>
  );
};

export default EventDetail;
