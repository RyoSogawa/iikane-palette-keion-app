'use client';

import React, { useMemo } from 'react';

import { TagsInput, type TagsInputProps } from '@mantine/core';
import { type FieldValues, useController, type UseControllerProps } from 'react-hook-form';

import { type UserTag } from '@/types/generated/zod';

export type ControlledUserTagsInputProps<T extends FieldValues> = {
  tags: Array<Pick<UserTag, 'id' | 'name'>>;
} & Pick<UseControllerProps<T>, 'name' | 'control' | 'disabled' | 'rules'> &
  Omit<TagsInputProps, 'onChange' | 'value' | 'disabled' | 'error' | 'data' | 'label' | 'maxTags'>;

const ControlledUserTagsInput = <T extends FieldValues>({
  tags,
  name,
  control,
  disabled,
  rules,
  ...props
}: ControlledUserTagsInputProps<T>) => {
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
    disabled,
    rules,
  });

  const tagNames = useMemo(() => tags.map((tag) => tag.name), [tags]);

  return (
    <TagsInput
      data={tagNames}
      label="タグ"
      maxTags={10}
      error={error?.message}
      {...props}
      {...field}
    />
  );
};

export default ControlledUserTagsInput;
