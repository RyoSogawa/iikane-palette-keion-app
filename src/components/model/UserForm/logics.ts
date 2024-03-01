import type React from 'react';
import { useCallback } from 'react';

import { type UserPart, type User } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { api } from '@/trpc/react';

export type UserFormValues = Pick<User, 'id' | 'name' | 'nickname' | 'introduction'> & {
  UserPart: Array<Pick<UserPart, 'id' | 'partIcon' | 'order' | 'remark'>>;
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
            console.log('success');
            router.push(`/members/${data.id}`);
          },
          onError: (err) => {
            console.error(err);
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
