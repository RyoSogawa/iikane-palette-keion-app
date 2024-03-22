'use client';

import React, { useCallback, useState } from 'react';

import { Button, Flex, List, Modal, Space, Stack, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import { IconExclamationCircle, IconTrash } from '@tabler/icons-react';
import { useSession, signOut } from 'next-auth/react';

import { deleteAccount } from '@/components/model/AccountDeleteButton/actions';
import { NotificationOptions } from '@/constants/notification';

const AccountDeleteButton: React.FC = () => {
  const { data: session, status, update } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);

  const handleSubmit = useCallback(async () => {
    if (!session?.user.id) return;
    setIsSubmitting(true);

    await deleteAccount(session?.user.id)
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
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }, [session?.user.id, update]);

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
            loading={isSubmitting}
            disabled={status !== 'authenticated'}
            fullWidth
            onClick={handleSubmit}
          >
            削除
          </Button>
        </Flex>
      </Modal>
      <Button variant="outline" color="red" onClick={open}>
        <IconTrash size={14} />
        <Space w={4} />
        アカウント削除
      </Button>
    </>
  );
};

export default AccountDeleteButton;
