import React from 'react';

import { Group, type GroupProps } from '@mantine/core';
import { type User } from '@prisma/client';
import {
  IconBrandApplePodcast,
  IconBrandInstagram,
  IconBrandX,
  IconMusic,
  IconWorldWww,
} from '@tabler/icons-react';

import SnsLink from '@/components/model/UserProfile/parts/SnsLink';

export type SnsLinkProps = GroupProps & {
  user: Pick<User, 'instagramLink' | 'musicLink' | 'twitterLink' | 'websiteLink' | 'podcastLink'>;
};

const SnsLinks: React.FC<SnsLinkProps> = ({ user, ...props }) => {
  return (
    <Group {...props}>
      {user.musicLink && (
        <SnsLink href={user.musicLink} aria-label="music link">
          <IconMusic />
        </SnsLink>
      )}
      {user.podcastLink && (
        <SnsLink href={user.podcastLink} aria-label="podcast link">
          <IconBrandApplePodcast />
        </SnsLink>
      )}
      {user.twitterLink && (
        <SnsLink href={user.twitterLink} aria-label="twitter link">
          <IconBrandX />
        </SnsLink>
      )}
      {user.instagramLink && (
        <SnsLink href={user.instagramLink} aria-label="instagram link">
          <IconBrandInstagram />
        </SnsLink>
      )}
      {user.websiteLink && (
        <SnsLink href={user.websiteLink} aria-label="website link">
          <IconWorldWww />
        </SnsLink>
      )}
    </Group>
  );
};

export default SnsLinks;
