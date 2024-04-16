import type React from 'react';
import { useCallback } from 'react';

import { showNotification } from '@mantine/notifications';
import { type User } from '@prisma/client';
import { useForm } from 'react-hook-form';

import { NotificationOptions } from '@/constants/notification';
import { api } from '@/trpc/react';

export type UserFormValues = Pick<
  User,
  | 'id'
  | 'name'
  | 'nickname'
  | 'residence'
  | 'introduction'
  | 'instagramUsername'
  | 'twitterUsername'
  | 'websiteLink'
  | 'musicLink'
  | 'podcastLink'
> & {
  tags: string[];
};

export const useUserForm = (defaultValues: UserFormValues) => {
  const {
    handleSubmit: submit,
    control,
    formState: { isSubmitting },
  } = useForm<UserFormValues>({
    defaultValues,
  });

  const { mutateAsync } = api.user.update.useMutation();

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      await submit(async (data) => {
        await mutateAsync(data)
          .then(() => {
            showNotification({
              ...NotificationOptions.success,
              message: 'プロフィールを更新しました 👍🏽',
            });
          })
          .catch((err) => {
            console.error(err);
            showNotification(NotificationOptions.error);
          });
      })(e);
    },
    [mutateAsync, submit],
  );

  return {
    handleSubmit,
    control,
    isLoading: isSubmitting,
  };
};
