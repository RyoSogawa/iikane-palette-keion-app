import React from 'react';

import { Avatar, UnstyledButton } from '@mantine/core';

export type ParticipantAvatarProps = {
  name: string;
  image: string | null;
  isMe?: boolean;
  size?: number;
  onClick?: () => void;
};

/** 参加者のアバター。名前は画面に出さないので、読み上げ用に aria-label で持つ */
const ParticipantAvatar: React.FC<ParticipantAvatarProps> = ({
  name,
  image,
  isMe = false,
  size = 30,
  onClick,
}) => {
  const avatar = (
    <Avatar
      src={image}
      alt={name}
      name={name}
      color="initials"
      size={size}
      radius="xl"
      imageProps={{ loading: 'lazy' }}
      style={isMe ? { outline: '2px solid var(--mantine-color-white)' } : undefined}
    />
  );

  if (!onClick) return avatar;

  return (
    <UnstyledButton aria-label={name} style={{ borderRadius: '50%' }} onClick={onClick}>
      {avatar}
    </UnstyledButton>
  );
};

export default ParticipantAvatar;
