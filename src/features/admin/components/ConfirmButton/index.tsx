'use client';

import React, { useCallback, useState } from 'react';

import { Button, type ButtonProps, Group, Modal, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

export type ConfirmButtonProps = ButtonProps & {
  children: React.ReactNode;
  title: string;
  message: React.ReactNode;
  confirmLabel: string;
  onConfirm: () => Promise<void>;
};

/**
 * 押すと確認モーダルを開き、確定したときだけ onConfirm を実行するボタン。
 * window.confirm はブラウザ操作の自動化を止めてしまうので使わない。
 */
const ConfirmButton: React.FC<ConfirmButtonProps> = ({
  children,
  title,
  message,
  confirmLabel,
  onConfirm,
  color,
  ...props
}) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [isRunning, setIsRunning] = useState(false);

  const handleConfirm = useCallback(async () => {
    setIsRunning(true);
    try {
      await onConfirm();
      close();
    } finally {
      setIsRunning(false);
    }
  }, [close, onConfirm]);

  return (
    <>
      <Button color={color} {...props} onClick={open}>
        {children}
      </Button>
      <Modal opened={opened} title={title} centered onClose={close}>
        <Text size="sm">{message}</Text>
        <Group justify="flex-end" mt="lg">
          <Button variant="default" disabled={isRunning} onClick={close}>
            キャンセル
          </Button>
          <Button color={color} loading={isRunning} onClick={handleConfirm}>
            {confirmLabel}
          </Button>
        </Group>
      </Modal>
    </>
  );
};

export default ConfirmButton;
