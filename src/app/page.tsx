import { Container, Title } from '@mantine/core';
import Link from 'next/link';

import JamSessionHomeLink from '@/features/jam-session/components/JamSessionHomeLink';

export default function Home() {
  return (
    <Container py={16}>
      <Title>Home</Title>
      <ul>
        <li>
          <Link href="/events">イベント</Link>
        </li>
        <li>
          <Link href="/members">部員名簿</Link>
        </li>
        <JamSessionHomeLink />
      </ul>
    </Container>
  );
}
