'use client';

import React, { useMemo } from 'react';

import { Avatar, type AvatarProps } from '@mantine/core';

import { useAvatarUpdatedAt } from '@/store/avatar-updated-at';

export type CurrentUserAvatarProps = AvatarProps;

const CurrentUserAvatar: React.FC<CurrentUserAvatarProps> = ({ src, ...props }) => {
  const avatarUpdatedAt = useAvatarUpdatedAt((store) => store.avatarUpdatedAt);

  const srcWithUpdatedAt = useMemo(() => {
    if (!src) return undefined;
    const url = new URL(src);
    url.searchParams.set('updatedAt', avatarUpdatedAt);
    return url.toString();
  }, [src, avatarUpdatedAt]);

  return <Avatar src={srcWithUpdatedAt} {...props} />;
};

export default CurrentUserAvatar;
