'use client';

import React from 'react';

import { Button, Stack } from '@mantine/core';

import { type UserFormValues, useUserForm } from '@/components/model/UserForm/logics';
import ControlledTextInput from '@/components/ui/ControlledTextInput';

export type UserFormProps = {
  user: UserFormValues;
};

const UserForm: React.FC<UserFormProps> = ({ user }) => {
  const { handleSubmit, control } = useUserForm(user);

  return (
    <form onSubmit={handleSubmit}>
      <Stack>
        <ControlledTextInput label="お名前" control={control} name="name" />
        <ControlledTextInput label="ニックネーム" control={control} name="nickname" />
      </Stack>
      <Button type="submit" variant="outline" mt={32} size="lg">
        保存する
      </Button>
    </form>
  );
};

export default UserForm;
