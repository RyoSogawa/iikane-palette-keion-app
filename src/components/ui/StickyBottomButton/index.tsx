import React from 'react';

import { Button, type ButtonProps, Container } from '@mantine/core';

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
    <Container pos="sticky" bottom={24} ta="center" p={0} mt={mt}>
      <Button radius="xl" size="md" {...props} onClick={onClick}>
        {children}
      </Button>
    </Container>
  );
};

export default StickyBottomButton;
