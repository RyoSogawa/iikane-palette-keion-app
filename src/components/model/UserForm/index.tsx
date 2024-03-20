'use client';

import React from 'react';

import { Button, Flex, Paper, Space, Stack, Title } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';

import { type UserFormValues, useUserForm } from '@/components/model/UserForm/logics';
import AvatarInput, { type AvatarInputProps } from '@/components/model/UserForm/parts/AvatarInput';
import ControlledUserTagsInput, {
  type ControlledUserTagsInputProps,
} from '@/components/model/UserForm/parts/ControlledUserTagsInput';
import ControlledRichEditor from '@/components/ui/ControlledRichEditor';
import ControlledTextInput from '@/components/ui/ControlledTextInput';

export type UserFormProps = {
  user: UserFormValues & AvatarInputProps['user'];
  tags: ControlledUserTagsInputProps<UserFormValues>['tags'];
};

const UserForm: React.FC<UserFormProps> = ({ user, tags }) => {
  const { handleSubmit, control, isLoading } = useUserForm(user);

  return (
    <form onSubmit={handleSubmit}>
      <Paper p="lg" radius="md" withBorder>
        <Stack>
          <AvatarInput user={user} />
          <Flex direction={{ base: 'column', sm: 'row' }} gap="md" w="100%">
            <ControlledTextInput label="お名前" control={control} name="name" flex={1} required />
            <ControlledTextInput label="ニックネーム" control={control} name="nickname" flex={1} />
          </Flex>
          <ControlledTextInput label="お住まいの地域" control={control} name="residence" />
          <ControlledUserTagsInput tags={tags} control={control} name="tags" />
        </Stack>
      </Paper>
      <Paper p="lg" radius="md" mt={32} withBorder>
        <Stack>
          <Title order={2}>リンク</Title>
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
            label="Webサイト"
            control={control}
            name="websiteLink"
            placeholder="https://..."
            type="url"
          />
        </Stack>
      </Paper>
      <ControlledRichEditor
        label="自己紹介等"
        mt={32}
        labelProps={{ fz: 'lg', fw: 700 }}
        control={control}
        name="introduction"
        placeholder="スペースならある。半生でも好きな音楽でも自由に語りたまえ。"
      />
      <Button type="submit" variant="filled" mt={32} loading={isLoading}>
        <IconCheck size={18} />
        <Space w={8} />
        保存
      </Button>
    </form>
  );
};

export default UserForm;
