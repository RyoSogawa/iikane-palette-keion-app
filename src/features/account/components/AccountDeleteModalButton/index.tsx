'use client';

import React, { useCallback } from 'react';

import { Button, Flex, List, Modal, Space, Stack, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import { IconExclamationCircle, IconTrash } from '@tabler/icons-react';
import { useSession, signOut } from 'next-auth/react';

import { NotificationOptions } from '@/constants/notification';
import { api } from '@/trpc/react';

const AccountDeleteModalButton: React.FC = () => {
  const { status } = useSession();
  const [opened, { open, close }] = useDisclosure(false);
  const { mutateAsync, isLoading } = api.user.deleteMe.useMutation();

  const handleSubmit = useCallback(() => {
    mutateAsync()
      .then(() => {
        void signOut({ callbackUrl: '/' });
        showNotification({
          ...NotificationOptions.success,
          message: 'アカウントを削除しました 👋🏽',
        });
      })
      .catch((err) => {
        console.error(err);
        showNotification(NotificationOptions.error);
      });
  }, [mutateAsync]);

  return (
    <>
      <Modal opened={opened} onClose={close}>
        <Stack align="center">
          <IconExclamationCircle size={40} color="var(--mantine-color-red-filled)" />
          <Title order={2}>アカウントを削除します</Title>
          <Text>以下の情報を削除します。</Text>
          <List>
            <List.Item>プロフィール情報</List.Item>
            <List.Item>ログインアカウント</List.Item>
          </List>
          <Text>この操作は元に戻せません。よろしいですか？</Text>
        </Stack>
        <Flex mt={36} justify="space-between" gap="md">
          <Button variant="outline" color="gray" fullWidth onClick={close}>
            キャンセル
          </Button>
          <Button
            color="red"
            loading={isLoading}
            disabled={status !== 'authenticated'}
            fullWidth
            onClick={handleSubmit}
          >
            削除
          </Button>
        </Flex>
      </Modal>
      <Button variant="outline" color="red" disabled={status !== 'authenticated'} onClick={open}>
        <IconTrash size={14} />
        <Space w={4} />
        アカウント削除
      </Button>
    </>
  );
};

export default AccountDeleteModalButton;
