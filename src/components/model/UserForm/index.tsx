'use client';

import React from 'react';

import { Button, Flex, Paper, Space, Stack, Title } from '@mantine/core';
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
          <Flex direction={{ base: 'column', sm: 'row' }} gap="md" w="100%">
            <ControlledTextInput label="お名前" control={control} name="name" flex={1} required />
            <ControlledTextInput label="ニックネーム" control={control} name="nickname" flex={1} />
          </Flex>
          <ControlledTextInput label="お住まいの地域" control={control} name="residence" />
          <ControlledRichEditor label="自己紹介" control={control} name="introduction" />
        </Stack>
      </Paper>
      <Paper p="lg" radius="md" mt={32} withBorder>
        <Stack>
          <Title order={2}>担当パート</Title>
          <InstrumentExp control={control} />
        </Stack>
      </Paper>
      <Paper p="lg" radius="md" mt={32} withBorder>
        <Stack>
          <Title order={2}>リンク</Title>
          <ControlledTextInput
            label="X/Twitter"
            control={control}
            name="twitterLink"
            placeholder="https://twitter.com/..."
            type="url"
          />
          <ControlledTextInput
            label="Instagram"
            control={control}
            name="instagramLink"
            placeholder="https://www.instagram.com/..."
            type="url"
          />
          <ControlledTextInput
            label="音楽等"
            control={control}
            name="musicLink"
            placeholder="https://..."
            type="url"
          />
          <ControlledTextInput
            label="ポッドキャスト"
            control={control}
            name="podcastLink"
            placeholder="https://..."
            type="url"
          />
          <ControlledTextInput
            label="Webサイト"
            control={control}
            name="websiteLink"
            placeholder="https://..."
            type="url"
          />
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
