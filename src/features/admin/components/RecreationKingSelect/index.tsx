'use client';

import React, { useCallback, useMemo, useState } from 'react';

import { Button, Group, MultiSelect } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

import { useUnsavedChanges } from '@/features/admin/components/UnsavedChangesGuard';
import { notifyError, notifySaved } from '@/features/admin/logics/form-errors';
import { api } from '@/trpc/react';

export type RecreationKingSelectProps = {
  eventId: string;
  userIds: string[];
  users: Array<{ id: string; name: string | null }>;
};

// 選んだ順は保存結果に関係しないので、並びを揃えてから比べる
const toKey = (ids: string[]) => [...ids].sort().join(',');

/** レクリエーション王に選ぶユーザー */
const RecreationKingSelect: React.FC<RecreationKingSelectProps> = ({ eventId, userIds, users }) => {
  const router = useRouter();
  const [selected, setSelected] = useState(userIds);
  const [savedIds, setSavedIds] = useState(userIds);
  useUnsavedChanges(toKey(selected) !== toKey(savedIds));
  const setRecreationKings = api.admin.event.setRecreationKings.useMutation();

  const options = useMemo(
    () => users.map((user) => ({ value: user.id, label: user.name ?? user.id })),
    [users],
  );

  const handleSave = useCallback(async () => {
    try {
      await setRecreationKings.mutateAsync({ eventId, userIds: selected });
      setSavedIds(selected);
      notifySaved('レク王を保存しました');
      router.refresh();
    } catch (error) {
      notifyError(error);
    }
  }, [eventId, router, selected, setRecreationKings]);

  return (
    <Group align="flex-end">
      <MultiSelect
        label="レク王"
        placeholder="名前で検索"
        data={options}
        value={selected}
        flex={1}
        searchable
        clearable
        onChange={setSelected}
      />
      <Button
        loading={setRecreationKings.isPending}
        leftSection={<IconCheck size={18} />}
        onClick={handleSave}
      >
        保存
      </Button>
    </Group>
  );
};

export default RecreationKingSelect;
