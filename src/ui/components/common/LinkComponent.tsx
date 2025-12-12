'use client';

import type { AnchorHTMLAttributes } from 'react';

import Link from 'next/link';

import type { LinkProps } from 'next/link';

type LinkComponentProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> &
  LinkProps;

const LinkComponent = (props: LinkComponentProps) => {
  return <Link {...props} />;
};

export default LinkComponent;
