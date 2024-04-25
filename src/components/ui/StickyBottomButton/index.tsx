import React from 'react';

import { Box, Button, type ButtonProps } from '@mantine/core';

import s from './style.module.css';

export type StickyBottomButtonProps = ButtonProps & {
  onClick?: () => void;
};

const StickyBottomButton: React.FC<StickyBottomButtonProps> = ({
  mt,
  children,
  onClick,
  ...props
}) => {
  return (
    <Box mt={mt} className={s.wrapper}>
      <Button radius="xl" size="md" {...props} onClick={onClick}>
        {children}
      </Button>
    </Box>
  );
};

export default StickyBottomButton;
