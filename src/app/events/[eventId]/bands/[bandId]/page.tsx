import React from 'react';

import { Breadcrumbs, Container, Text } from '@mantine/core';
import { IconHome } from '@tabler/icons-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import BandDetail from '@/features/event/components/BandDetail';
import { api } from '@/trpc/server';

import type { Metadata } from 'next';

export const revalidate = 3600;

type Props = {
  params: Promise<{
    eventId: string;
    bandId: string;
  }>;
};

const findEventAndBand = async ({ eventId, bandId }: { eventId: string; bandId: string }) => {
  const trpc = await api();
  const event = await trpc.event.findById({
    id: eventId,
  });
  const band = event?.Band.find((b) => b.id === bandId);
  if (!event || !band) {
    notFound();
  }
  return { event, band };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { band } = await findEventAndBand(await params);

  return {
    title: band.name,
  };
}

export default async function BandPage({ params }: Props) {
  const { eventId, bandId } = await params;
  const { event, band } = await findEventAndBand({ eventId, bandId });

  return (
    <Container py={16}>
      <Breadcrumbs fz="xs">
        <Link href="/">
          <IconHome size={16} />
        </Link>
        <Link href="/events">イベント</Link>
        <Link href={`/events/${eventId}`}>{event.name}</Link>
        <Text fz="xs">{band.name}</Text>
      </Breadcrumbs>
      <BandDetail band={band} />
    </Container>
  );
}
