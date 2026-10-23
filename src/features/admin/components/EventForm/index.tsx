'use client';

import React, { useCallback } from 'react';

import { Button, Flex, Stack, Textarea, TextInput } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { fromDateTimeLocal, toDateTimeLocal } from '@/features/admin/logics/datetime-local';
import { notifyError, notifySaved, setSchemaErrors } from '@/features/admin/logics/form-errors';
import { eventInputSchema } from '@/server/api/routers/admin/schemas';
import { api } from '@/trpc/react';

type EventFormValues = {
  name: string;
  description: string;
  dateFrom: string;
  dateTo: string;
  movie: string;
  driveLink: string;
};

export type EventFormProps = {
  /** 渡さなければ新規作成 */
  event?: {
    id: string;
    name: string;
    description: string | null;
    dateFrom: Date;
    dateTo: Date;
    movie: string | null;
    driveLink: string | null;
  };
};

const toFormValues = (event: EventFormProps['event']): EventFormValues => ({
  name: event?.name ?? '',
  description: event?.description ?? '',
  dateFrom: event ? toDateTimeLocal(event.dateFrom) : '',
  dateTo: event ? toDateTimeLocal(event.dateTo) : '',
  movie: event?.movie ?? '',
  driveLink: event?.driveLink ?? '',
});

/**
 * イベントの基本情報のフォーム。サーバーと同じスキーマで先に検証し、項目ごとにエラーを出す。
 */
const EventForm: React.FC<EventFormProps> = ({ event }) => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EventFormValues>({ defaultValues: toFormValues(event) });
  const create = api.admin.event.create.useMutation();
  const update = api.admin.event.update.useMutation();

  const onSubmit = useCallback(
    async (values: EventFormValues) => {
      const input = {
        ...values,
        dateFrom: fromDateTimeLocal(values.dateFrom),
        dateTo: fromDateTimeLocal(values.dateTo),
      };
      const { dateFrom, dateTo } = input;
      if (!dateFrom || !dateTo) {
        if (!dateFrom) setError('dateFrom', { message: '開始日時を入力してください' });
        if (!dateTo) setError('dateTo', { message: '終了日時を入力してください' });
        return;
      }
      const data = { ...input, dateFrom, dateTo };
      const parsed = eventInputSchema.safeParse(data);
      if (!parsed.success) {
        setSchemaErrors(parsed.error, setError);
        return;
      }

      try {
        if (event) {
          await update.mutateAsync({ id: event.id, data });
          notifySaved();
          router.refresh();
        } else {
          const created = await create.mutateAsync(data);
          notifySaved('下書きを作成しました');
          router.push(`/admin/events/${created.id}`);
        }
      } catch (error) {
        notifyError(error);
      }
    },
    [create, event, router, setError, update],
  );

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)}>
      <Stack>
        <TextInput label="イベント名" required {...register('name')} error={errors.name?.message} />
        <Flex direction={{ base: 'column', sm: 'row' }} gap="md">
          <TextInput
            label="開始日時"
            type="datetime-local"
            flex={1}
            required
            {...register('dateFrom')}
            error={errors.dateFrom?.message}
          />
          <TextInput
            label="終了日時"
            type="datetime-local"
            flex={1}
            required
            {...register('dateTo')}
            error={errors.dateTo?.message}
          />
        </Flex>
        <Textarea
          label="説明"
          minRows={4}
          autosize
          {...register('description')}
          error={errors.description?.message}
        />
        <TextInput
          label="ダイジェスト動画（埋め込み URL）"
          placeholder="https://www.youtube.com/embed/..."
          type="url"
          {...register('movie')}
          error={errors.movie?.message}
        />
        <TextInput
          label="Google Drive リンク"
          placeholder="https://drive.google.com/..."
          type="url"
          {...register('driveLink')}
          error={errors.driveLink?.message}
        />
        <Button
          type="submit"
          loading={isSubmitting}
          leftSection={<IconCheck size={18} />}
          maw={400}
          mx="auto"
          fullWidth
        >
          {event ? '保存' : '下書きを作成'}
        </Button>
      </Stack>
    </form>
  );
};

export default EventForm;
