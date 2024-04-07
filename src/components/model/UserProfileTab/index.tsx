'use client';

import React, { useCallback, useMemo } from 'react';

import { Tabs } from '@mantine/core';
import { IconMusic, IconUser } from '@tabler/icons-react';
import { usePathname, useRouter } from 'next/navigation';

export type UserProfileTabProps = {
  userId: string;
};

const UserProfileTab: React.FC<UserProfileTabProps> = ({ userId }) => {
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
      router.push(`/members/${userId}/${newValue}`);
    },
    [router, userId],
  );

  return (
    <Tabs value={value} my={32} onChange={handleChange}>
      <Tabs.List justify="center">
        <Tabs.Tab value="profile" leftSection={<IconUser size={16} />}>
          Profile
        </Tabs.Tab>
        <Tabs.Tab value="my-best-songs" leftSection={<IconMusic size={16} />}>
          My Best Songs
        </Tabs.Tab>
      </Tabs.List>
    </Tabs>
  );
};

export default UserProfileTab;
