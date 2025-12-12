import React from 'react';

import { ActionIcon, type ActionIconProps } from '@mantine/core';

import LinkComponent from '@/ui/components/common/LinkComponent';

export type IconLinkProps = ActionIconProps & {
  href: string;
  title: string;
};

const IconLink: React.FC<IconLinkProps> = ({ href, title, children, ...props }) => {
  return (
    <ActionIcon
      component={LinkComponent}
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
