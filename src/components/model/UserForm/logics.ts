import type React from 'react';
import { useCallback } from 'react';

import { showNotification } from '@mantine/notifications';
import { type UserPart, type User } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { NotificationOptions } from '@/constants/notification';
import { api } from '@/trpc/react';

export type UserFormValues = Pick<User, 'id' | 'name' | 'nickname' | 'introduction'> & {
  UserParts: Array<Pick<UserPart, 'id' | 'partIcon' | 'order' | 'remark'>>;
};

export const useUserForm = (defaultValues: UserFormValues) => {
  const router = useRouter();
  const { handleSubmit: submit, control } = useForm<UserFormValues>({
    defaultValues,
  });

  const { mutate, isLoading } = api.user.updateProfile.useMutation();

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      await submit((data) => {
        mutate(data, {
          onSuccess: () => {
            showNotification({
              ...NotificationOptions.success,
              message: 'プロフィールを更新しました',
            });
            router.push(`/members/${data.id}`);
          },
          onError: (err) => {
            console.error(err);
            showNotification(NotificationOptions.error);
          },
        });
      })(e);
    },
    [mutate, router, submit],
  );

  return {
    handleSubmit,
    control,
    isLoading,
  };
};
