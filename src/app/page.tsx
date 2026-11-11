import { Container, Title } from '@mantine/core';
import Link from 'next/link';

import { getServerAuthSession } from '@/server/auth';

export default async function Home() {
  const session = await getServerAuthSession();

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
        {session && (
          <li>
            <Link href="/jam-session">セッション</Link>
          </li>
        )}
      </ul>
    </Container>
  );
}
