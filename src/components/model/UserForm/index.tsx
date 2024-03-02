'use client';

import React from 'react';

import { Button, Paper, Space, Stack, Title } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';

import { type UserFormValues, useUserForm } from '@/components/model/UserForm/logics';
import InstrumentExp from '@/components/model/UserForm/parts/InstrumentExp';
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
      <Paper p="lg" radius="md" mt={32} withBorder>
        <Stack>
          <Title order={2}>担当パート</Title>
          <InstrumentExp control={control} />
        </Stack>
      </Paper>
      <Button type="submit" variant="filled" mt={32} loading={isLoading}>
        <IconCheck size={18} />
        <Space w={8} />
        保存
      </Button>
    </form>
  );
};

export default UserForm;
