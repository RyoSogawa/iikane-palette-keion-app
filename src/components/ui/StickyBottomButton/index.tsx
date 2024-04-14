import React from 'react';

import { Box, Button, type ButtonProps } from '@mantine/core';

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
    <Box pos="sticky" bottom={24} ta="center" p={0} mt={mt}>
      <Button radius="xl" size="md" {...props} onClick={onClick}>
        {children}
      </Button>
    </Box>
  );
};

export default StickyBottomButton;
