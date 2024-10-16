'use client';

import React from 'react';

import { Box, type BoxProps, Tooltip } from '@mantine/core';

import IconCrown from '@/features/event/components/RecreationKingBadge/parts/IconCrown';

import type { CrownColor } from '@/features/event/components/RecreationKingBadge/parts/IconCrown';

const getClownColor = (kingCount: number): CrownColor => {
  if (kingCount === 1) return 'bronze';
  if (kingCount === 2) return 'silver';
  return 'gold';
};

export type RecreationKingBadgeProps = Omit<BoxProps, 'children'> & {
  size?: number;
  kingCount: number;
};

const RecreationKingBadge: React.FC<RecreationKingBadgeProps> = ({
  size = 24,
  kingCount,
  ...props
}) => {
  if (!kingCount) return null;

  return (
    <Tooltip label={`レク王×${kingCount}`}>
      <Box component="span" fz={size} lh={1} {...props}>
        <IconCrown crownColor={getClownColor(kingCount)} />
      </Box>
    </Tooltip>
  );
};

export default RecreationKingBadge;
