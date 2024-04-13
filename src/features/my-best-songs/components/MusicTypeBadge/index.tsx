import React from 'react';

import { Badge } from '@mantine/core';

import { type MusicType } from '@/types/music';

export type MusicTypeBadgeProps = {
  type: MusicType;
};

const MusicTypeBadge: React.FC<MusicTypeBadgeProps> = ({ type }) => {
  return (
    <Badge variant="light" color={type === 'track' ? 'indigo' : 'pink'} size="xs">
      {type}
    </Badge>
  );
};

export default MusicTypeBadge;
