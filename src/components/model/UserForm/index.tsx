'use client';

import React from 'react';

import { Button, Stack } from '@mantine/core';

import { type UserFormValues, useUserForm } from '@/components/model/UserForm/logics';
import ControlledRichEditor from '@/components/ui/ControlledRichEditor';
import ControlledTextInput from '@/components/ui/ControlledTextInput';

export type UserFormProps = {
  user: UserFormValues;
};

const UserForm: React.FC<UserFormProps> = ({ user }) => {
  const { handleSubmit, control } = useUserForm(user);

  return (
    <form onSubmit={handleSubmit}>
      <Stack>
        <ControlledTextInput label="お名前" control={control} name="name" required />
        <ControlledTextInput label="ニックネーム" control={control} name="nickname" />
        <ControlledRichEditor label="自己紹介" control={control} name="introduction" />
      </Stack>
      <Button type="submit" variant="outline" mt={32} size="lg">
        保存する
      </Button>
    </form>
  );
};

export default UserForm;
