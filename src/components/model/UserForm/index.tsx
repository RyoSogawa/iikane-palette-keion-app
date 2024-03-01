'use client';

import React from 'react';

import { Button, Paper, Stack, Title } from '@mantine/core';

import { type UserFormValues, useUserForm } from '@/components/model/UserForm/logics';
import ControlledRichEditor from '@/components/ui/ControlledRichEditor';
import ControlledTextInput from '@/components/ui/ControlledTextInput';

export type UserFormProps = {
  user: UserFormValues;
};

const UserForm: React.FC<UserFormProps> = ({ user }) => {
  const { handleSubmit, control, isLoading } = useUserForm(user);

  return (
    <form onSubmit={handleSubmit}>
      <Paper p="lg" radius="md" withBorder>
        <Stack>
          <Title order={2}>基本情報</Title>
          <ControlledTextInput label="お名前" control={control} name="name" required />
          <ControlledTextInput label="ニックネーム" control={control} name="nickname" />
          <ControlledRichEditor label="自己紹介" control={control} name="introduction" />
        </Stack>
      </Paper>
      <Button type="submit" variant="filled" mt={32} loading={isLoading}>
        保存する
      </Button>
    </form>
  );
};

export default UserForm;
