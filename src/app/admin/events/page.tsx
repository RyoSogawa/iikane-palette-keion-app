import React from 'react';

import { Box, Button, Group, Title } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

import AdminEventTable from '@/features/admin/components/AdminEventTable';
import { api } from '@/trpc/server';
import LinkComponent from '@/ui/components/common/LinkComponent';

export default async function AdminEventsPage() {
  const trpc = await api();
  const events = await trpc.admin.event.list();

  return (
    <>
      <Group justify="space-between">
        <Title>イベント管理</Title>
        <Button
          component={LinkComponent}
          href="/admin/events/new"
          leftSection={<IconPlus size={16} />}
        >
          新規作成
        </Button>
      </Group>
      <Box mt="xl">
        <AdminEventTable events={events} />
      </Box>
    </>
  );
}
