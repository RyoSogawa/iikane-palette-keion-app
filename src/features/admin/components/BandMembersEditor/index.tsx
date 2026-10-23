'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';

import { type DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ActionIcon,
  Button,
  Flex,
  Group,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { IconCheck, IconGripVertical, IconPlus, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

import { notifyError, notifySaved } from '@/features/admin/logics/form-errors';
import { membersInputSchema } from '@/server/api/routers/admin/schemas';
import { api } from '@/trpc/react';
import DnDContext from '@/ui/components/functional/DnDContext';

type MemberRow = { key: string; userId: string | null; userName: string; part: string };

export type BandMembersEditorProps = {
  bandId: string;
  members: Array<{ userId: string; userName: string | null; part: string | null }>;
  users: Array<{ id: string; name: string | null }>;
};

type MemberRowEditorProps = {
  row: MemberRow;
  userOptions: Array<{ value: string; label: string }>;
  onChange: (row: MemberRow) => void;
  onRemove: () => void;
};

const MemberRowEditor: React.FC<MemberRowEditorProps> = ({
  row,
  userOptions,
  onChange,
  onRemove,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: row.key });

  return (
    <Paper
      ref={setNodeRef}
      p="sm"
      style={{ transform: CSS.Transform.toString(transform), transition }}
      withBorder
      {...attributes}
    >
      <Flex
        gap="sm"
        align={{ base: 'stretch', sm: 'flex-end' }}
        direction={{ base: 'column', sm: 'row' }}
      >
        <IconGripVertical
          aria-label="ドラッグアンドドロップで並び替える"
          size={20}
          cursor="grab"
          style={{ touchAction: 'none', flexShrink: 0 }}
          {...listeners}
        />
        <Select
          label="ユーザー"
          placeholder="名前で検索"
          data={userOptions}
          value={row.userId}
          flex={2}
          searchable
          onChange={(userId) => onChange({ ...row, userId })}
        />
        <TextInput
          label="表示名（任意）"
          description="ユーザー名の代わりに表示する"
          value={row.userName}
          flex={2}
          onChange={(e) => onChange({ ...row, userName: e.currentTarget.value })}
        />
        <TextInput
          label="パート"
          placeholder="Vo, Gt など"
          value={row.part}
          flex={1}
          onChange={(e) => onChange({ ...row, part: e.currentTarget.value })}
        />
        <ActionIcon
          variant="subtle"
          color="red"
          aria-label="メンバーを外す"
          mb={4}
          onClick={onRemove}
        >
          <IconTrash size={18} />
        </ActionIcon>
      </Flex>
    </Paper>
  );
};

/** バンドメンバーの編集。並べた順がそのまま表示順になり、保存で一覧ごと置き換える */
const BandMembersEditor: React.FC<BandMembersEditorProps> = ({ bandId, members, users }) => {
  const router = useRouter();
  // 行のキーはサーバーとブラウザで同じ値になるよう連番にする（乱数だとハイドレーションでずれる）
  const nextKey = useRef(members.length);
  const [rows, setRows] = useState<MemberRow[]>(() =>
    members.map((member, index) => ({
      key: `member-${index}`,
      userId: member.userId,
      userName: member.userName ?? '',
      part: member.part ?? '',
    })),
  );
  const setMembers = api.admin.band.setMembers.useMutation();

  const userOptions = useMemo(
    () => users.map((user) => ({ value: user.id, label: user.name ?? user.id })),
    [users],
  );

  const updateRow = useCallback(
    (key: string) => (row: MemberRow) =>
      setRows((current) => current.map((r) => (r.key === key ? row : r))),
    [],
  );
  const removeRow = useCallback(
    (key: string) => () => setRows((current) => current.filter((r) => r.key !== key)),
    [],
  );
  const addRow = useCallback(() => {
    const key = `member-${nextKey.current}`;
    nextKey.current += 1;
    setRows((current) => [...current, { key, userId: null, userName: '', part: '' }]);
  }, []);

  const handleDragEnd = useCallback(({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    setRows((current) =>
      arrayMove(
        current,
        current.findIndex((r) => r.key === active.id),
        current.findIndex((r) => r.key === over.id),
      ),
    );
  }, []);

  const handleSave = useCallback(async () => {
    if (rows.some((row) => !row.userId)) {
      notifyError(new Error('ユーザーを選んでいない行があります'));
      return;
    }
    const input = rows.map(({ userId, userName, part }) => ({
      userId: userId ?? '',
      userName,
      part,
    }));
    const parsed = membersInputSchema.safeParse(input);
    if (!parsed.success) {
      notifyError(new Error(parsed.error.issues[0]?.message));
      return;
    }
    try {
      await setMembers.mutateAsync({ bandId, members: input });
      notifySaved('メンバーを保存しました');
      router.refresh();
    } catch (error) {
      notifyError(error);
    }
  }, [bandId, router, rows, setMembers]);

  return (
    <Stack>
      {rows.length === 0 && <Text c="dimmed">メンバーはまだいません</Text>}
      <DnDContext onDragEnd={handleDragEnd}>
        <SortableContext items={rows.map((row) => row.key)} strategy={verticalListSortingStrategy}>
          <Stack gap="xs">
            {rows.map((row) => (
              <MemberRowEditor
                key={row.key}
                row={row}
                userOptions={userOptions}
                onChange={updateRow(row.key)}
                onRemove={removeRow(row.key)}
              />
            ))}
          </Stack>
        </SortableContext>
      </DnDContext>
      <Group justify="space-between">
        <Button variant="light" leftSection={<IconPlus size={16} />} onClick={addRow}>
          メンバーを追加
        </Button>
        <Button
          loading={setMembers.isPending}
          leftSection={<IconCheck size={18} />}
          onClick={handleSave}
        >
          メンバーを保存
        </Button>
      </Group>
    </Stack>
  );
};

export default BandMembersEditor;
