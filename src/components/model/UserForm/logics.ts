import type React from 'react';
import { useCallback } from 'react';

import { showNotification } from '@mantine/notifications';
import { type User } from '@prisma/client';
import { useForm } from 'react-hook-form';

import { updateUserProfile } from '@/components/model/UserForm/actions';
import { NotificationOptions } from '@/constants/notification';

export type UserFormValues = Pick<
  User,
  | 'id'
  | 'name'
  | 'nickname'
  | 'residence'
  | 'introduction'
  | 'instagramLink'
  | 'twitterLink'
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

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      await submit(async (data) => {
        await updateUserProfile(data)
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
    [submit],
  );

  return {
    handleSubmit,
    control,
    isLoading: isSubmitting,
  };
};
