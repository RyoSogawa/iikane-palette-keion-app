import React from 'react';

import { ActionIcon, type ActionIconProps } from '@mantine/core';
import Link from 'next/link';

export type IconLinkProps = ActionIconProps & {
  href: string;
  title: string;
};

const IconLink: React.FC<IconLinkProps> = ({ href, title, children, ...props }) => {
  return (
    <ActionIcon
      component={Link}
      target="_blank"
      rel="noreferrer"
      variant="filled"
      w={32}
      h={32}
      href={href}
      title={title}
      aria-label={title}
      {...props}
    >
      {children}
    </ActionIcon>
  );
};

export default IconLink;
