'use client';

import React, { useCallback } from 'react';

import { Button, Group, Stack, Textarea, TextInput } from '@mantine/core';
import { IconCheck, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import ConfirmButton from '@/features/admin/components/ConfirmButton';
import { notifyError, notifySaved, setSchemaErrors } from '@/features/admin/logics/form-errors';
import { bandInputSchema, type BandInput } from '@/server/api/routers/admin/schemas';
import { api } from '@/trpc/react';

export type BandFormProps = {
  eventId: string;
  band: { id: string; name: string; description: string | null; movie: string | null };
};

/** バンドの基本情報のフォーム。削除もここから行う */
const BandForm: React.FC<BandFormProps> = ({ eventId, band }) => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<BandInput>({
    defaultValues: {
      name: band.name,
      description: band.description ?? '',
      movie: band.movie ?? '',
    },
  });
  const update = api.admin.band.update.useMutation();
  const remove = api.admin.band.remove.useMutation();

  const onSubmit = useCallback(
    async (data: BandInput) => {
      const parsed = bandInputSchema.safeParse(data);
      if (!parsed.success) {
        setSchemaErrors(parsed.error, setError);
        return;
      }
      try {
        await update.mutateAsync({ id: band.id, data });
        notifySaved();
        router.refresh();
      } catch (error) {
        notifyError(error);
      }
    },
    [band.id, router, setError, update],
  );

  const handleRemove = useCallback(async () => {
    try {
      await remove.mutateAsync({ id: band.id });
      notifySaved('バンドを削除しました');
      router.push(`/admin/events/${eventId}`);
    } catch (error) {
      notifyError(error);
    }
  }, [band.id, eventId, remove, router]);

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)}>
      <Stack>
        <TextInput label="バンド名" required {...register('name')} error={errors.name?.message} />
        <Textarea
          label="説明"
          minRows={3}
          autosize
          {...register('description')}
          error={errors.description?.message}
        />
        <TextInput
          label="ライブ動画（埋め込み URL）"
          placeholder="https://www.youtube.com/embed/..."
          type="url"
          {...register('movie')}
          error={errors.movie?.message}
        />
        <Group justify="space-between">
          <ConfirmButton
            color="red"
            variant="subtle"
            leftSection={<IconTrash size={16} />}
            title="バンドを削除する"
            message={`「${band.name}」とそのメンバー情報を削除します。元に戻せません。`}
            confirmLabel="削除する"
            onConfirm={handleRemove}
          >
            バンドを削除
          </ConfirmButton>
          <Button type="submit" loading={isSubmitting} leftSection={<IconCheck size={18} />}>
            保存
          </Button>
        </Group>
      </Stack>
    </form>
  );
};

export default BandForm;
