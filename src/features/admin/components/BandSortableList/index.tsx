'use client';

import React, { useCallback, useState } from 'react';

import { type DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Anchor, Button, Group, Paper, Stack, Text, TextInput } from '@mantine/core';
import { IconGripVertical, IconPlus } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

import { notifyError, notifySuccess } from '@/features/admin/logics/notifications';
import { api } from '@/trpc/react';
import LinkComponent from '@/ui/components/common/LinkComponent';
import DnDContext from '@/ui/components/functional/DnDContext';

type BandItem = { id: string; name: string; memberCount: number };

export type BandSortableListProps = {
  eventId: string;
  bands: BandItem[];
};

const SortableBandRow: React.FC<{ eventId: string; band: BandItem; order: number }> = ({
  eventId,
  band,
  order,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: band.id });

  return (
    <Paper
      ref={setNodeRef}
      p="sm"
      style={{ transform: CSS.Transform.toString(transform), transition }}
      withBorder
      {...attributes}
    >
      <Group wrap="nowrap">
        <IconGripVertical
          aria-label="ドラッグアンドドロップで出演順を並び替える"
          size={20}
          cursor="grab"
          style={{ touchAction: 'none', flexShrink: 0 }}
          {...listeners}
        />
        <Text c="dimmed" w={32}>
          {order}
        </Text>
        <Anchor
          component={LinkComponent}
          href={`/admin/events/${eventId}/bands/${band.id}`}
          flex={1}
        >
          {band.name}
        </Anchor>
        <Text size="sm" c="dimmed">
          {band.memberCount} 人
        </Text>
      </Group>
    </Paper>
  );
};

/** 出演バンドの一覧。ドラッグで出演順を変えるとすぐ保存する */
const BandSortableList: React.FC<BandSortableListProps> = ({ eventId, bands: initialBands }) => {
  const router = useRouter();
  const [bands, setBands] = useState(initialBands);
  const [newBandName, setNewBandName] = useState('');
  const reorder = api.admin.band.reorder.useMutation();
  const create = api.admin.band.create.useMutation();

  const handleDragEnd = useCallback(
    async ({ active, over }: DragEndEvent) => {
      if (!over || active.id === over.id) return;
      const previous = bands;
      const next = arrayMove(
        bands,
        bands.findIndex((band) => band.id === active.id),
        bands.findIndex((band) => band.id === over.id),
      );
      setBands(next);
      try {
        await reorder.mutateAsync({ eventId, bandIds: next.map((band) => band.id) });
        notifySuccess('出演順を保存しました');
      } catch (error) {
        setBands(previous);
        notifyError(error);
      }
    },
    [bands, eventId, reorder],
  );

  const handleCreate = useCallback(async () => {
    try {
      const band = await create.mutateAsync({
        eventId,
        data: { name: newBandName, description: '', movie: '' },
      });
      router.push(`/admin/events/${eventId}/bands/${band.id}`);
    } catch (error) {
      notifyError(error);
    }
  }, [create, eventId, newBandName, router]);

  return (
    <Stack>
      {bands.length === 0 ? (
        <Text c="dimmed">バンドはまだありません</Text>
      ) : (
        <DnDContext onDragEnd={handleDragEnd}>
          <SortableContext items={bands} strategy={verticalListSortingStrategy}>
            <Stack gap="xs">
              {bands.map((band, index) => (
                <SortableBandRow key={band.id} eventId={eventId} band={band} order={index + 1} />
              ))}
            </Stack>
          </SortableContext>
        </DnDContext>
      )}
      <Group align="flex-end">
        <TextInput
          label="バンドを追加"
          placeholder="バンド名"
          value={newBandName}
          flex={1}
          onChange={(e) => setNewBandName(e.currentTarget.value)}
        />
        <Button
          loading={create.isPending}
          disabled={newBandName.trim() === ''}
          leftSection={<IconPlus size={16} />}
          onClick={handleCreate}
        >
          追加
        </Button>
      </Group>
    </Stack>
  );
};

export default BandSortableList;
