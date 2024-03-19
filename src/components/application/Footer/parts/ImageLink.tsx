import React from 'react';

import { Flex, type FlexProps, Image } from '@mantine/core';
import Link from 'next/link';

export type ImageLinkProps = FlexProps & {
  href: string;
  src: string;
  title: string;
  imageW?: number;
  imageH?: number;
};

const ImageLink: React.FC<ImageLinkProps> = ({ href, src, title, imageW, imageH, ...props }) => {
  return (
    <Flex
      component={Link}
      href={href}
      target="_blank"
      rel="noreferrer"
      align="center"
      justify="center"
      w={32}
      h={32}
      style={{ overflow: 'hidden', borderRadius: 'var(--mantine-radius-default)' }}
      title={title}
      {...props}
    >
      <Image src={src} alt={title} loading="lazy" w={imageW} h={imageH} />
    </Flex>
  );
};

export default ImageLink;
