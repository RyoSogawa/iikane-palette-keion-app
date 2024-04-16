import React from 'react';

import { Alert, Button } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import Link from 'next/link';

import s from '../style.module.css';

export type YourProfileAlertProps = {
  userId: string;
};

const YourProfileAlert: React.FC<YourProfileAlertProps> = ({ userId }) => {
  return (
    <Alert
      variant="light"
      color="blue"
      mt={-16}
      mb={24}
      py="xs"
      pr={{ base: 'xs', sm: 'md' }}
      classNames={{
        icon: s.alertIcon,
        wrapper: s.alertWrapper,
        message: s.alertMessage,
      }}
      icon={<IconInfoCircle />}
    >
      あなたのプロフィールです
      <Button component={Link} href={`/members/${userId}/edit/profile`} variant="subtle" px="xs">
        編集
      </Button>
    </Alert>
  );
};

export default YourProfileAlert;
