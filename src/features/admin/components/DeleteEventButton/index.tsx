'use client';

import React, { useCallback } from 'react';

import { IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

import ConfirmButton from '@/features/admin/components/ConfirmButton';
import { notifyError, notifySaved } from '@/features/admin/logics/notifications';
import { api } from '@/trpc/react';

export type DeleteEventButtonProps = {
  event: { id: string; name: string };
};

/** イベントを削除するボタン。バンドやメンバーも一緒に消える */
const DeleteEventButton: React.FC<DeleteEventButtonProps> = ({ event }) => {
  const router = useRouter();
  const remove = api.admin.event.remove.useMutation();

  const handleConfirm = useCallback(async () => {
    try {
      await remove.mutateAsync({ id: event.id });
      notifySaved('イベントを削除しました');
      router.push('/admin/events');
    } catch (error) {
      notifyError(error);
    }
  }, [event.id, remove, router]);

  return (
    <ConfirmButton
      color="red"
      variant="subtle"
      leftSection={<IconTrash size={16} />}
      title="イベントを削除する"
      message={`「${event.name}」と、そのバンド・メンバー・レク王の情報をすべて削除します。元に戻せません。`}
      confirmLabel="削除する"
      onConfirm={handleConfirm}
    >
      イベントを削除
    </ConfirmButton>
  );
};

export default DeleteEventButton;
