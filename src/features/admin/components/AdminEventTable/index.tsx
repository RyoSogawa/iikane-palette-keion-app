'use client';

import React from 'react';

import { Anchor, Badge, Table, Text } from '@mantine/core';

import { formatJst } from '@/features/admin/logics/datetime-local';
import LinkComponent from '@/ui/components/common/LinkComponent';

export type AdminEventTableProps = {
  events: Array<{
    id: string;
    name: string;
    dateFrom: Date;
    isDraft: boolean;
    createdAt: Date;
    updatedAt: Date;
    _count: { Band: number };
  }>;
};

/** 管理画面のイベント一覧。公開状態と作成・更新日時を並べる */
const AdminEventTable: React.FC<AdminEventTableProps> = ({ events }) => {
  if (events.length === 0) {
    return <Text c="dimmed">イベントはまだありません</Text>;
  }

  return (
    <Table.ScrollContainer minWidth={640}>
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>状態</Table.Th>
            <Table.Th>イベント名</Table.Th>
            <Table.Th>開催日</Table.Th>
            <Table.Th>バンド数</Table.Th>
            <Table.Th>作成日時</Table.Th>
            <Table.Th>更新日時</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {events.map((event) => (
            <Table.Tr key={event.id}>
              <Table.Td>
                <Badge variant="light" color={event.isDraft ? 'gray' : 'blue'}>
                  {event.isDraft ? '下書き' : '公開中'}
                </Badge>
              </Table.Td>
              <Table.Td>
                <Anchor component={LinkComponent} href={`/admin/events/${event.id}`}>
                  {event.name}
                </Anchor>
              </Table.Td>
              <Table.Td>{formatJst(event.dateFrom).slice(0, 10)}</Table.Td>
              <Table.Td>{event._count.Band}</Table.Td>
              <Table.Td>{formatJst(event.createdAt)}</Table.Td>
              <Table.Td>{formatJst(event.updatedAt)}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
};

export default AdminEventTable;
