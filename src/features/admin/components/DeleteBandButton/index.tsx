'use client';

import React, { useCallback } from 'react';

import { IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

import ConfirmButton from '@/features/admin/components/ConfirmButton';
import { notifyError, notifySaved } from '@/features/admin/logics/form-errors';
import { api } from '@/trpc/react';

export type DeleteBandButtonProps = {
  eventId: string;
  band: { id: string; name: string };
};

/** バンドを削除するボタン。メンバー情報も一緒に消える */
const DeleteBandButton: React.FC<DeleteBandButtonProps> = ({ eventId, band }) => {
  const router = useRouter();
  const remove = api.admin.band.remove.useMutation();

  const handleConfirm = useCallback(async () => {
    try {
      await remove.mutateAsync({ id: band.id });
      notifySaved('バンドを削除しました');
      router.push(`/admin/events/${eventId}`);
    } catch (error) {
      notifyError(error);
    }
  }, [band.id, eventId, remove, router]);

  return (
    <ConfirmButton
      color="red"
      variant="subtle"
      leftSection={<IconTrash size={16} />}
      title="バンドを削除する"
      message={`「${band.name}」とそのメンバー情報を削除します。元に戻せません。`}
      confirmLabel="削除する"
      onConfirm={handleConfirm}
    >
      バンドを削除
    </ConfirmButton>
  );
};

export default DeleteBandButton;
