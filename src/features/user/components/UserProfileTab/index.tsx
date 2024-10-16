'use client';

import React, { useCallback, useMemo } from 'react';

import { Tabs } from '@mantine/core';
import { IconHeart, IconUser } from '@tabler/icons-react';
import { usePathname, useRouter } from 'next/navigation';

import s from './style.module.css';

export type UserProfileTabProps = {
  userId: string;
  isEdit?: boolean;
};

const UserProfileTab: React.FC<UserProfileTabProps> = ({ userId, isEdit }) => {
  const router = useRouter();
  const pathname = usePathname();

  const value = useMemo(() => {
    if (pathname.includes('my-best-songs')) {
      return 'my-best-songs';
    }
    return 'profile';
  }, [pathname]);

  const handleChange = useCallback(
    (newValue: string | null) => {
      if (isEdit) {
        router.push(`/members/${userId}/edit/${newValue}`);
        return;
      }
      router.replace(`/members/${userId}/${newValue}`);
    },
    [isEdit, router, userId],
  );

  return (
    <Tabs value={value} className={s.wrapper} onChange={handleChange}>
      <Tabs.List justify="center">
        <Tabs.Tab
          value="profile"
          leftSection={<IconUser size={16} />}
          w={{ base: '50%', sm: 'auto' }}
          miw={160}
        >
          Profile
        </Tabs.Tab>
        <Tabs.Tab
          value="my-best-songs"
          leftSection={<IconHeart size={16} />}
          w={{ base: '50%', sm: 'auto' }}
          miw={160}
        >
          My Best Songs
        </Tabs.Tab>
      </Tabs.List>
    </Tabs>
  );
};

export default UserProfileTab;
