import React from 'react';

import { Alert, Anchor, Group } from '@mantine/core';
import { IconEye } from '@tabler/icons-react';
import { notFound } from 'next/navigation';

import BandDetail from '@/features/event/components/BandDetail';
import { api } from '@/trpc/server';
import LinkComponent from '@/ui/components/common/LinkComponent';

type Props = {
  params: Promise<{ eventId: string; bandId: string }>;
};

/** 公開ページと同じコンポーネントで、下書きのバンドページを確認する */
export default async function AdminBandPreviewPage({ params }: Props) {
  const { eventId, bandId } = await params;
  const trpc = await api();
  const event = await trpc.admin.event.findById({ id: eventId });
  const band = event?.Band.find((b) => b.id === bandId);
  if (!event || !band) {
    notFound();
  }

  return (
    <>
      <Alert variant="light" color={event.isDraft ? 'gray' : 'blue'} icon={<IconEye />}>
        プレビュー（{event.isDraft ? '下書き・非公開' : '公開中'}）
        <Group gap="md" mt={4}>
          <Anchor component={LinkComponent} href={`/admin/events/${event.id}/preview`} fz="sm">
            イベントのプレビューへ
          </Anchor>
          <Anchor
            component={LinkComponent}
            href={`/admin/events/${event.id}/bands/${band.id}`}
            fz="sm"
          >
            編集に戻る
          </Anchor>
        </Group>
      </Alert>
      <BandDetail band={band} />
    </>
  );
}
