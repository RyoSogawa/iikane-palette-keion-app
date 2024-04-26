import React from 'react';

import { ActionIcon } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

export type NextPrevButtonProps = {
  dir: 'next' | 'prev';
  disabled?: boolean;
  onClick: () => void;
};

const NextPrevButton: React.FC<NextPrevButtonProps> = ({ dir, disabled, onClick }) => {
  return (
    <ActionIcon disabled={disabled} size="xl" radius="xl" variant="default" onClick={onClick}>
      {dir === 'prev' ? <IconChevronLeft /> : <IconChevronRight />}
    </ActionIcon>
  );
};

export default NextPrevButton;
