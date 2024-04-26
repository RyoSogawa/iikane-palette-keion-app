import React from 'react';

import { Badge, type MantineSize } from '@mantine/core';

import { type SongTypeType } from '@/types/generated/zod';

export type MusicTypeBadgeProps = {
  type: SongTypeType;
  size?: MantineSize;
};

const MusicTypeBadge: React.FC<MusicTypeBadgeProps> = ({ type, size = 'xs' }) => {
  return (
    <Badge variant="light" color={type === 'track' ? 'indigo' : 'pink'} size={size}>
      {type}
    </Badge>
  );
};

export default MusicTypeBadge;
