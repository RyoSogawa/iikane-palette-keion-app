import React from 'react';

import { Badge, type BadgeProps, type DefaultMantineColor } from '@mantine/core';

export type EventStatus = 'preparation' | 'applicationAcceptance' | 'inProgress' | 'archive';

const EventStatusMap: Record<EventStatus, { color: DefaultMantineColor; text: string }> = {
  preparation: { color: 'gray', text: '準備中' },
  applicationAcceptance: { color: 'blue', text: '申込受付中' },
  inProgress: { color: 'green', text: '開催中' },
  archive: { color: 'red', text: 'アーカイブ' },
};

export type EventStatusBadgeProps = BadgeProps & {
  eventStatus: EventStatus;
};

const EventStatusBadge: React.FC<EventStatusBadgeProps> = ({ eventStatus, ...props }) => {
  return (
    <Badge variant="light" size="sm" color={EventStatusMap[eventStatus].color} {...props}>
      {EventStatusMap[eventStatus].text}
    </Badge>
  );
};

export default EventStatusBadge;
