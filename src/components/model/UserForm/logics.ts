import type React from 'react';
import { useCallback } from 'react';

import { type UserPart, type User } from '@prisma/client';
import { useForm } from 'react-hook-form';

export type UserFormValues = Pick<User, 'id' | 'name' | 'nickname' | 'introduction'> & {
  UserPart: Array<Pick<UserPart, 'id' | 'part' | 'detail' | 'order' | 'experience' | 'remark'>>;
};

export const useUserForm = (defaultValues: UserFormValues) => {
  const { handleSubmit: submit, control } = useForm<UserFormValues>({
    defaultValues,
  });

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      await submit((data) => {
        console.log(data);
      })(e);
    },
    [submit],
  );

  return {
    handleSubmit,
    control,
  };
};
