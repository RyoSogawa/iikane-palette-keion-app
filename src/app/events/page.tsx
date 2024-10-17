import { Container, SimpleGrid, Title } from '@mantine/core';
import { unstable_noStore } from 'next/cache';

import EventCard from '@/features/event/components/EventCard';
import { api } from '@/trpc/server';

export default async function Events() {
  /**
   * HACK: t3-qppのバグ対応
   * [TRPCClientError]: Dynamic server usage: Page couldn't be rendered statically because it used `headers`.
   * @see https://github.com/t3-oss/create-t3-app/issues/1599#issuecomment-2007564869
   */
  unstable_noStore();

  const [events] = await Promise.all([api.event.getAll.query()]);

  return (
    <Container py={16}>
      <Title>イベント</Title>
      <SimpleGrid cols={{ base: 1, sm: 2 }} mt="xl">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </SimpleGrid>
    </Container>
  );
}
