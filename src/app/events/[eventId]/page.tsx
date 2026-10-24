import React from 'react';

import { Breadcrumbs, Container, Text } from '@mantine/core';
import { IconHome } from '@tabler/icons-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import EventDetail from '@/features/event/components/EventDetail';
import { api } from '@/trpc/server';

import type { Metadata } from 'next';

export const revalidate = 3600;

type Props = {
  params: Promise<{
    eventId: string;
  }>;
};

const findEvent = async (eventId: string) => {
  const trpc = await api();
  const event = await trpc.event.findById({
    id: eventId,
  });
  if (!event) {
    notFound();
  }
  return event;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = await findEvent((await params).eventId);

  return {
    title: event.name,
  };
}

export default async function EventPage({ params }: Props) {
  const event = await findEvent((await params).eventId);

  return (
    <Container py={16}>
      <Breadcrumbs fz="xs">
        <Link href="/">
          <IconHome size={16} />
        </Link>
        <Link href="/events">イベント</Link>
        <Text fz="xs">{event.name}</Text>
      </Breadcrumbs>
      <EventDetail event={event} bandHref={(bandId) => `/events/${event.id}/bands/${bandId}`} />
    </Container>
  );
}
