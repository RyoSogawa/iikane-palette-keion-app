'use client';

import React, { useCallback } from 'react';

import {
  Flex,
  SegmentedControl,
  type SegmentedControlItem,
  type SegmentedControlProps,
} from '@mantine/core';
import { IconGridDots, IconList } from '@tabler/icons-react';

import s from './style.module.css';

export type ListType = 'list' | 'grid';

const data: SegmentedControlItem[] = [
  {
    label: (
      <Flex align="center" justify="center">
        <IconList aria-label="リスト" />
      </Flex>
    ),
    value: 'list',
  },
  {
    label: (
      <Flex align="center" justify="center">
        <IconGridDots aria-label="グリッド" />
      </Flex>
    ),
    value: 'grid',
  },
];

export type ListTypeSwitcherProps = Omit<SegmentedControlProps, 'data' | 'value' | 'onChange'> & {
  currentType: ListType;
  onChange?: (value: ListType) => void;
};

const ListTypeSwitcher: React.FC<ListTypeSwitcherProps> = ({ currentType, onChange, ...props }) => {
  const handleChange = useCallback(
    (value: string) => {
      onChange?.(value as ListType);
    },
    [onChange],
  );

  return (
    <SegmentedControl
      {...props}
      className={s.wrapper}
      data={data}
      value={currentType}
      size="lg"
      onChange={handleChange}
    />
  );
};

export default ListTypeSwitcher;
