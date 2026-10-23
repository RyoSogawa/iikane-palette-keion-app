'use client';

import React, { useCallback, useState } from 'react';

import { Button, FileButton, Group, Image, Stack, Text } from '@mantine/core';
import { IconPhotoUp, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

import { removeEventImage, uploadEventImage } from '@/features/admin/actions/event-image';
import { notifyError, notifySaved } from '@/features/admin/logics/notifications';
import { resizeImageForUpload } from '@/utils/resize-image';

import type {
  EventImageKind,
  EventImageTarget,
} from '@/server/applications/services/event-image-storage.service';

export type EventImageInputProps = {
  label: string;
  target: EventImageTarget;
  src: string | null;
};

// サーバーで縮める先（縦長の写真は高さ 1800px）より小さく送ると、縦長の写真がぼやける
const UPLOAD_MAX_EDGE: Record<EventImageKind, number> = {
  event: 1800,
  bandPhoto: 1800,
  bandImage: 1200,
  bandTypoImage: 1200,
};

const toFormData = (target: EventImageTarget, file?: File) => {
  const formData = new FormData();
  Object.entries(target).forEach(([key, value]) => formData.append(key, value));
  if (file) formData.append('file', file);
  return formData;
};

/** イベント・バンドの画像を 1 枚アップロードして差し替える入力 */
const EventImageInput: React.FC<EventImageInputProps> = ({ label, target, src }) => {
  const router = useRouter();
  const [isBusy, setIsBusy] = useState(false);

  const run = useCallback(
    async (action: () => Promise<unknown>, message: string) => {
      setIsBusy(true);
      try {
        await action();
        notifySaved(message);
        router.refresh();
      } catch (error) {
        notifyError(error);
      } finally {
        setIsBusy(false);
      }
    },
    [router],
  );

  const handleChange = useCallback(
    async (file: File | null) => {
      if (!file) return;
      await run(
        async () =>
          uploadEventImage(
            toFormData(target, await resizeImageForUpload(file, UPLOAD_MAX_EDGE[target.kind])),
          ),
        `${label}を更新しました`,
      );
    },
    [label, run, target],
  );

  const handleRemove = useCallback(
    () => run(() => removeEventImage(toFormData(target)), `${label}を外しました`),
    [label, run, target],
  );

  return (
    <Stack gap={8}>
      <Text size="sm" fw={500}>
        {label}
      </Text>
      {src ? (
        <Image src={src} alt="" maw={320} radius="sm" bg="gray" />
      ) : (
        <Text size="sm" c="dimmed">
          未設定
        </Text>
      )}
      <Group gap="xs">
        <FileButton accept="image/*" disabled={isBusy} onChange={handleChange}>
          {(props) => (
            <Button {...props} size="xs" loading={isBusy} leftSection={<IconPhotoUp size={14} />}>
              {src ? '差し替える' : 'アップロード'}
            </Button>
          )}
        </FileButton>
        {src && (
          <Button
            size="xs"
            variant="subtle"
            color="red"
            disabled={isBusy}
            leftSection={<IconTrash size={14} />}
            onClick={handleRemove}
          >
            外す
          </Button>
        )}
      </Group>
    </Stack>
  );
};

export default EventImageInput;
