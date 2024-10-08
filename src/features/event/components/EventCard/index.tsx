'use client';

import React from 'react';

import { Card, Image, Text } from '@mantine/core';
import { format } from 'date-fns';
import Link from 'next/link';

import { type Event } from '@/types/generated/zod';

export type EventCardProps = {
  event: Pick<Event, 'id' | 'dateTo' | 'dateFrom' | 'name' | 'image'>;
};

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  return (
    <Card shadow="sm" padding="xl" component={Link} href={`/events/${event.id}`}>
      <Card.Section>
        <Image src={event.image} h={160} alt="" loading="lazy" />
      </Card.Section>
      <Text mt="md" c="dimmed" size="sm">
        {format(new Date(event.dateFrom), 'yyyy/MM/dd')} -{' '}
        {format(new Date(event.dateTo), 'yyyy/MM/dd')}
      </Text>
      <Text fw={600} size="lg" mt="xs">
        {event.name}
      </Text>
    </Card>
  );
};

export default EventCard;
