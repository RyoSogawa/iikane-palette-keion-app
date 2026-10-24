import React from 'react';

import { Anchor, Breadcrumbs, Text, Title } from '@mantine/core';

import EventForm from '@/features/admin/components/EventForm';
import LinkComponent from '@/ui/components/common/LinkComponent';

export default function NewEventPage() {
  return (
    <>
      <Breadcrumbs fz="xs">
        <Anchor component={LinkComponent} href="/admin/events" fz="xs">
          イベント管理
        </Anchor>
        <Text fz="xs">新規作成</Text>
      </Breadcrumbs>
      <Title mt="lg" mb="xl">
        イベントを作成
      </Title>
      <EventForm />
    </>
  );
}
