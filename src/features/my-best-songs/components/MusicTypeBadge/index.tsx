import React from 'react';

import { Badge } from '@mantine/core';

import { type SongTypeType } from '@/types/generated/zod';

export type MusicTypeBadgeProps = {
  type: SongTypeType;
};

const MusicTypeBadge: React.FC<MusicTypeBadgeProps> = ({ type }) => {
  return (
    <Badge variant="light" color={type === 'track' ? 'indigo' : 'pink'} size="xs">
      {type}
    </Badge>
  );
};

export default MusicTypeBadge;
