'use client';

import React from 'react';

import { Card, Group, Image, Text } from '@mantine/core';
import Link from 'next/link';

import EventStatusBadge from '@/features/event/components/EventStatusBadge';
import { type Event } from '@/types/generated/zod';
import { formatDateString } from '@/utils/date';

export type EventCardProps = {
  event: Pick<Event, 'id' | 'dateTo' | 'dateFrom' | 'name' | 'image'>;
};

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  return (
    <Card shadow="sm" p="lg" component={Link} href={`/events/${event.id}`}>
      <Card.Section>
        <Image src={event.image} h={160} alt="" loading="lazy" />
      </Card.Section>
      <Group align="center" mt="md">
        <Text fw={600} size="lg">
          {event.name}
        </Text>
        <EventStatusBadge eventStatus="archive" />
      </Group>
      <Text mt="xs" c="dimmed" fz="sm">
        {formatDateString(event.dateFrom)} - {formatDateString(event.dateTo)}
      </Text>
    </Card>
  );
};

export default EventCard;
