'use client';

import React from 'react';

import { Button, Fieldset, Flex, Space, Stack } from '@mantine/core';
import { IconAt, IconCheck } from '@tabler/icons-react';

import ControlledRichEditor from '@/components/ui/ControlledRichEditor';
import ControlledTextInput from '@/components/ui/ControlledTextInput';

import { type UserFormValues, useUserForm } from './logics';
import AvatarInput, { type AvatarInputProps } from './parts/AvatarInput';
import ControlledUserTagsInput, {
  type ControlledUserTagsInputProps,
} from './parts/ControlledUserTagsInput';

export type UserFormProps = {
  user: UserFormValues & AvatarInputProps['user'];
  tags: ControlledUserTagsInputProps<UserFormValues>['tags'];
};

const UserForm: React.FC<UserFormProps> = ({ user, tags }) => {
  const { handleSubmit, control, isLoading } = useUserForm(user);

  return (
    <form onSubmit={handleSubmit}>
      <Fieldset legend="基本情報">
        <Stack>
          <AvatarInput user={user} />
          <Flex direction={{ base: 'column', sm: 'row' }} gap="md" w="100%">
            <ControlledTextInput label="お名前" control={control} name="name" flex={1} required />
            <ControlledTextInput label="ニックネーム" control={control} name="nickname" flex={1} />
          </Flex>
          <ControlledTextInput label="お住まいの地域" control={control} name="residence" />
          <ControlledUserTagsInput tags={tags} control={control} name="tags" />
        </Stack>
      </Fieldset>
      <Fieldset legend="リンク" mt={32}>
        <Stack>
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
            name="twitterUsername"
            placeholder="ユーザー名"
            leftSection={<IconAt size={14} />}
            inputMode="url"
          />
          <ControlledTextInput
            label="Instagram"
            control={control}
            name="instagramUsername"
            placeholder="ユーザー名"
            leftSection={<IconAt size={14} />}
            inputMode="url"
          />
          <ControlledTextInput
            label="Webサイト"
            control={control}
            name="websiteLink"
            placeholder="https://..."
            type="url"
          />
        </Stack>
      </Fieldset>
      <ControlledRichEditor
        label="自己紹介等"
        mt={32}
        labelProps={{ fz: 'lg', fw: 700 }}
        control={control}
        name="introduction"
        placeholder="スペースならある。半生でも好きな音楽でも自由に語りたまえ。"
      />
      <Button
        type="submit"
        variant="filled"
        mt={40}
        loading={isLoading}
        size="md"
        maw={400}
        mx="auto"
        fullWidth
      >
        <IconCheck size={18} />
        <Space w={8} />
        保存
      </Button>
    </form>
  );
};

export default UserForm;
