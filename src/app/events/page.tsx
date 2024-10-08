import { Container, SimpleGrid, Title } from '@mantine/core';

import EventCard from '@/features/event/components/EventCard';
import { api } from '@/trpc/server';

export default async function Events() {
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
