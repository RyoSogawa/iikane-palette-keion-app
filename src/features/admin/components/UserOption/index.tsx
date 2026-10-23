'use client';

import React from 'react';

import {
  Avatar,
  type ComboboxItem,
  type ComboboxLikeRenderOptionInput,
  Group,
  Text,
} from '@mantine/core';

import { type UserOptionSource } from '@/features/admin/logics/user-options';

/**
 * ユーザーを選ぶ Select / MultiSelect の renderOption を作る。
 * 同じ名前のユーザーも見分けられるよう、名前の横にアイコンを出す。
 */
export const createUserOptionRenderer = (users: UserOptionSource[]) => {
  const imageById = new Map(users.map((user) => [user.id, user.image]));

  const UserOption = ({ option }: ComboboxLikeRenderOptionInput<ComboboxItem>) => (
    <Group gap="xs" wrap="nowrap">
      <Avatar src={imageById.get(option.value)} alt="" size={24} bg="gray" />
      <Text size="sm" truncate="end">
        {option.label}
      </Text>
    </Group>
  );
  UserOption.displayName = 'UserOption';

  return UserOption;
};
