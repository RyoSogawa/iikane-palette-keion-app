'use client';

import { useEffect } from 'react';

import { Button, Container, Text, Title } from '@mantine/core';

import LinkComponent from '@/ui/components/common/LinkComponent';

export default function Error({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container component="main" py={16} ta="center">
      <Text display="block" fz={64}>
        👀
      </Text>
      <Title size={18} mt={8}>
        {error.message}
      </Title>
      <Button component={LinkComponent} href="/" variant="outline" mt={32}>
        TOPへ
      </Button>
    </Container>
  );
}
