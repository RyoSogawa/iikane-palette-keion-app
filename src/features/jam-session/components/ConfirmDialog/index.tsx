import React from 'react';

import { Button, Group, Modal, Text } from '@mantine/core';

export type ConfirmDialogProps = {
  opened: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/** 取り消しにくい操作の確認。ポップアップの上に重ねて出すので、元のポップアップより手前に置く */
const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  opened,
  title,
  message,
  confirmLabel,
  isPending,
  onConfirm,
  onCancel,
}) => (
  <Modal
    opened={opened}
    title={title}
    zIndex={300}
    size="sm"
    role="alertdialog"
    centered
    onClose={onCancel}
  >
    <Text fz="sm">{message}</Text>
    <Group mt="lg" grow>
      <Button variant="default" onClick={onCancel}>
        やめる
      </Button>
      <Button color="red" loading={isPending} onClick={onConfirm}>
        {confirmLabel}
      </Button>
    </Group>
  </Modal>
);

export default ConfirmDialog;
