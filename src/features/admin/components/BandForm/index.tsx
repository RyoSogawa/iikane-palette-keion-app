'use client';

import React, { useCallback } from 'react';

import { Button, Stack, Textarea, TextInput } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { useUnsavedChanges } from '@/features/admin/components/UnsavedChangesGuard';
import { notifyError, notifySaved, setSchemaErrors } from '@/features/admin/logics/form-errors';
import { bandInputSchema, type BandInput } from '@/server/api/routers/admin/schemas';
import { api } from '@/trpc/react';

export type BandFormProps = {
  band: { id: string; name: string; description: string | null; movie: string | null };
};

/** バンドの基本情報のフォーム */
const BandForm: React.FC<BandFormProps> = ({ band }) => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<BandInput>({
    defaultValues: {
      name: band.name,
      description: band.description ?? '',
      movie: band.movie ?? '',
    },
  });
  useUnsavedChanges(isDirty);
  const update = api.admin.band.update.useMutation();

  const onSubmit = useCallback(
    async (data: BandInput) => {
      const parsed = bandInputSchema.safeParse(data);
      if (!parsed.success) {
        setSchemaErrors(parsed.error, setError);
        return;
      }
      try {
        await update.mutateAsync({ id: band.id, data });
        reset(data);
        notifySaved();
        router.refresh();
      } catch (error) {
        notifyError(error);
      }
    },
    [band.id, reset, router, setError, update],
  );

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
        <Button
          type="submit"
          loading={isSubmitting}
          leftSection={<IconCheck size={18} />}
          maw={400}
          mx="auto"
          fullWidth
        >
          保存
        </Button>
      </Stack>
    </form>
  );
};

export default BandForm;
