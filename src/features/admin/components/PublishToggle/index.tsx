'use client';

import React, { useCallback } from 'react';

import { useRouter } from 'next/navigation';

import ConfirmButton from '@/features/admin/components/ConfirmButton';
import { notifyError, notifySaved } from '@/features/admin/logics/form-errors';
import { api } from '@/trpc/react';

export type PublishToggleProps = {
  eventId: string;
  isDraft: boolean;
};

/** イベントを公開する、または下書きに戻すボタン */
const PublishToggle: React.FC<PublishToggleProps> = ({ eventId, isDraft }) => {
  const router = useRouter();
  const setDraft = api.admin.event.setDraft.useMutation();

  const handleConfirm = useCallback(async () => {
    try {
      await setDraft.mutateAsync({ id: eventId, isDraft: !isDraft });
      notifySaved(isDraft ? '公開しました' : '下書きに戻しました');
      router.refresh();
    } catch (error) {
      notifyError(error);
    }
  }, [eventId, isDraft, router, setDraft]);

  return isDraft ? (
    <ConfirmButton
      color="blue"
      title="イベントを公開する"
      message="公開すると、イベント一覧に表示され誰でも見られるようになります。"
      confirmLabel="公開する"
      onConfirm={handleConfirm}
    >
      公開する
    </ConfirmButton>
  ) : (
    <ConfirmButton
      color="orange"
      variant="light"
      title="下書きに戻す"
      message="下書きに戻すと、公開ページからは見えなくなります。"
      confirmLabel="下書きに戻す"
      onConfirm={handleConfirm}
    >
      下書きに戻す
    </ConfirmButton>
  );
};

export default PublishToggle;
