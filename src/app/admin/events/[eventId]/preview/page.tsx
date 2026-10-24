import React from 'react';

import { Alert, Anchor } from '@mantine/core';
import { IconEye } from '@tabler/icons-react';
import { notFound } from 'next/navigation';

import EventDetail from '@/features/event/components/EventDetail';
import { api } from '@/trpc/server';
import LinkComponent from '@/ui/components/common/LinkComponent';

type Props = {
  params: Promise<{ eventId: string }>;
};

/** 公開ページと同じコンポーネントで、下書きのイベントを確認する */
export default async function AdminEventPreviewPage({ params }: Props) {
  const { eventId } = await params;
  const trpc = await api();
  const event = await trpc.admin.event.findById({ id: eventId });
  if (!event) {
    notFound();
  }

  return (
    <>
      <Alert variant="light" color={event.isDraft ? 'gray' : 'blue'} icon={<IconEye />}>
        プレビュー（{event.isDraft ? '下書き・非公開' : '公開中'}）{' '}
        <Anchor component={LinkComponent} href={`/admin/events/${event.id}`} fz="sm">
          編集に戻る
        </Anchor>
      </Alert>
      <EventDetail
        event={event}
        bandHref={(bandId) => `/admin/events/${event.id}/preview/bands/${bandId}`}
      />
    </>
  );
}
