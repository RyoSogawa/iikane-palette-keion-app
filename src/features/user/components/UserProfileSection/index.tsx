import React, { useId } from 'react';

import { Group, Title } from '@mantine/core';

export type UserProfileSectionProps = {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
};

/** プロフィールページ（閲覧側）の見出し付きの 1 区画。プロフィール文は SNS の自己紹介のように見出しを付けないので包まない */
const UserProfileSection: React.FC<UserProfileSectionProps> = ({ title, icon, children }) => {
  const titleId = useId();

  return (
    <section aria-labelledby={titleId}>
      <Group gap={8} mb="md">
        {icon}
        <Title id={titleId} order={2} size="h4">
          {title}
        </Title>
      </Group>
      {children}
    </section>
  );
};

export default UserProfileSection;
