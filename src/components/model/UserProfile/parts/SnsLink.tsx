import React from 'react';

import { ActionIcon } from '@mantine/core';
import Link from 'next/link';

export type SnsLinkProps = {
  href: string;
  'aria-label'?: string;
  children: React.ReactNode;
};

const SnsLink: React.FC<SnsLinkProps> = ({ children, href, 'aria-label': ariaLabel }) => {
  return (
    <ActionIcon
      component={Link}
      variant="subtle"
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={ariaLabel}
    >
      {children}
    </ActionIcon>
  );
};

export default SnsLink;
