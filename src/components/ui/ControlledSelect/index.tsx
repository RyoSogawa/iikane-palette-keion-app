'use client';

import React from 'react';

import { Select, type SelectProps } from '@mantine/core';
import { type FieldValues, useController, type UseControllerProps } from 'react-hook-form';

export type ControlledSelectProps<T extends FieldValues> = Omit<
  SelectProps,
  'onChange' | 'value' | 'disabled' | 'error'
> &
  Pick<UseControllerProps<T>, 'name' | 'control' | 'disabled' | 'rules'>;

const ControlledSelect = <T extends FieldValues>({
  name,
  control,
  disabled,
  rules,
  ...props
}: ControlledSelectProps<T>) => {
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
    disabled,
    rules,
  });

  return <Select checkIconPosition="right" {...props} {...field} error={error?.message} />;
};

export default ControlledSelect;
