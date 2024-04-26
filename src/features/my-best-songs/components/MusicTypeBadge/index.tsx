import React from 'react';

import { Badge, type BadgeProps } from '@mantine/core';

import { type SongTypeType } from '@/types/generated/zod';

export type MusicTypeBadgeProps = Omit<BadgeProps, 'variant' | 'color'> & {
  type: SongTypeType;
};

const MusicTypeBadge: React.FC<MusicTypeBadgeProps> = ({ type, size = 'xs', ...props }) => {
  return (
    <Badge {...props} variant="light" color={type === 'track' ? 'indigo' : 'pink'} size={size}>
      {type}
    </Badge>
  );
};

export default MusicTypeBadge;
