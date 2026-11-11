import React, { useState } from 'react';

import { ActionIcon, Anchor, Group, Menu, Stack, Text, Title } from '@mantine/core';
import { IconChevronLeft, IconDots, IconPencil, IconTrash } from '@tabler/icons-react';

import ConfirmDialog from '@/features/jam-session/components/ConfirmDialog';
import SessionFormModal from '@/features/jam-session/components/SessionFormModal';
import { formatHeldOn, fromHeldOn } from '@/server/api/routers/jam-session/held-on';
import LinkComponent from '@/ui/components/common/LinkComponent';

import type { JamSessionSummary } from '@/features/jam-session/types';
import type { SessionInput } from '@/server/api/routers/jam-session/schemas';

export type SessionHeaderProps = {
  session: JamSessionSummary;
  canManage: boolean;
  isPending: boolean;
  onUpdate: (input: SessionInput) => Promise<boolean>;
  onDelete: () => void;
};

/** セッションのページの見出し。一覧への戻り口と、作った人・管理者向けの変更・削除 */
const SessionHeader: React.FC<SessionHeaderProps> = ({
  session,
  canManage,
  isPending,
  onUpdate,
  onDelete,
}) => {
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <Stack gap={4}>
      <Anchor component={LinkComponent} href="/jam-session" fz="xs" c="dimmed">
        <Group gap={2}>
          <IconChevronLeft size={14} />
          セッション一覧
        </Group>
      </Anchor>
      <Group gap="xs" wrap="nowrap" align="flex-start">
        <Stack gap={0} flex={1} miw={0}>
          <Title order={1} fz="lg" c="bright">
            {session.name}
          </Title>
          <Text fz="xs" c="dimmed">
            {formatHeldOn(session.heldOn)}
          </Text>
        </Stack>
        {canManage && (
          <Menu position="bottom-end">
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray" aria-label="セッションのメニュー">
                <IconDots size={18} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<IconPencil size={14} />} onClick={() => setEditing(true)}>
                名前と日付を変更
              </Menu.Item>
              <Menu.Item
                color="red"
                leftSection={<IconTrash size={14} />}
                onClick={() => setConfirmingDelete(true)}
              >
                セッションを削除
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        )}
      </Group>

      <SessionFormModal
        opened={editing}
        title="名前と日付を変更"
        submitLabel="保存する"
        initialValue={{ name: session.name, heldOn: fromHeldOn(session.heldOn) }}
        isPending={isPending}
        onClose={() => setEditing(false)}
        onSubmit={(input) => void onUpdate(input).then((ok) => ok && setEditing(false))}
      />
      <ConfirmDialog
        opened={confirmingDelete}
        title="このセッションを消しますか？"
        message={`「${session.name}」の曲と参加の記録がすべて消えます。`}
        confirmLabel="消す"
        isPending={isPending}
        onConfirm={onDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </Stack>
  );
};

export default SessionHeader;
