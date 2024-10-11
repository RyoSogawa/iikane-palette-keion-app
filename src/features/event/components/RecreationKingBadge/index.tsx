import React, { type CSSProperties, useMemo } from 'react';

import { Box, type BoxProps } from '@mantine/core';
import { IconAwardFilled, IconRosetteFilled } from '@tabler/icons-react';

import type { Event } from '@/types/generated/zod';

export type RecreationKingBadgeProps = Omit<BoxProps, 'children'> & {
  size?: number;
  recreationKingEvents: Array<{
    event: Pick<Event, 'id' | 'name'>;
  }>;
};

const RecreationKingBadge: React.FC<RecreationKingBadgeProps> = ({
  size = 24,
  recreationKingEvents,
  ...props
}) => {
  const kingCount = recreationKingEvents.length;

  const icon = useMemo(() => {
    const commonStyle: CSSProperties = {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%,-50%)',
      color: 'var(--mantine-color-white)',
      width: size / 2,
      height: size / 2,
    };
    if (kingCount < 3)
      return (
        <IconAwardFilled
          style={{
            ...commonStyle,
          }}
        />
      );
    // TODO
    if (kingCount < 5)
      return (
        <IconAwardFilled
          style={{
            ...commonStyle,
          }}
        />
      );
    // TODO
    return (
      <IconAwardFilled
        style={{
          ...commonStyle,
        }}
      />
    );
  }, [kingCount, size]);

  if (!kingCount) return null;

  return (
    <Box pos="relative" display="inline-block" w={size} h={size} lh={1} {...props}>
      <IconRosetteFilled
        style={{
          width: '100%',
          height: '100%',
          color: 'var(--mantine-color-yellow-9)',
        }}
      />
      {icon}
    </Box>
  );
};

export default RecreationKingBadge;
