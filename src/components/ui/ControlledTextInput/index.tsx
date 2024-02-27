'use client';

import React from 'react';

import { TextInput, type TextInputProps } from '@mantine/core';
import { type FieldValues, useController, type UseControllerProps } from 'react-hook-form';

export type ControlledTextInputProps<T extends FieldValues> = Omit<
  TextInputProps,
  'onChange' | 'value' | 'disabled' | 'error'
> &
  Pick<UseControllerProps<T>, 'name' | 'control' | 'disabled' | 'rules'>;

const ControlledTextInput = <T extends FieldValues>({
  name,
  control,
  disabled,
  rules,
  ...props
}: ControlledTextInputProps<T>) => {
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
    disabled,
    rules,
  });

  return <TextInput {...props} {...field} error={error?.message} />;
};

export default ControlledTextInput;
