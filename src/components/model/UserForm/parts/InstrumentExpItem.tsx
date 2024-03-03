'use client';

import React, { useCallback } from 'react';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ActionIcon, Divider, Flex, Group, type SelectProps } from '@mantine/core';
import { IconGripVertical, IconTrash } from '@tabler/icons-react';
import { type Control } from 'react-hook-form';

import { type UserFormValues } from '@/components/model/UserForm/logics';
import ControlledSelect from '@/components/ui/ControlledSelect';
import ControlledTextInput from '@/components/ui/ControlledTextInput';
import { UserPartMap } from '@/constants/user-part';

const partIcons: SelectProps['data'] = Object.entries(UserPartMap).map(([value, label]) => ({
  value,
  label: label.name,
}));

export type InstrumentExpItemProps = {
  id: string;
  control: Control<UserFormValues>;
  index: number;
  onRemove: (index: number) => void;
};

const InstrumentExpItem: React.FC<InstrumentExpItemProps> = ({ id, control, index, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id,
  });

  const handleClickRemove = useCallback(() => {
    onRemove(index);
  }, [onRemove, index]);

  return (
    <>
      <Group
        ref={setNodeRef}
        style={{
          transform: CSS.Transform.toString(transform),
          transition,
        }}
        {...attributes}
      >
        <IconGripVertical
          aria-label="ドラッグアンドドロップで並び替える"
          size={22}
          cursor="grab"
          {...listeners}
        />
        <Flex direction={{ base: 'column', sm: 'row' }} gap="md" flex={1}>
          <ControlledSelect
            control={control}
            name={`UserParts.${index}.partIcon`}
            data={partIcons}
            w={{ base: '100%', sm: 130 }}
          />
          <ControlledTextInput
            control={control}
            name={`UserParts.${index}.remark`}
            placeholder="パート詳細や経験年数等について教えてね"
            flex="1"
          />
        </Flex>
        <ActionIcon aria-label="削除" variant="subtle" color="red" onClick={handleClickRemove}>
          <IconTrash size={18} />
        </ActionIcon>
      </Group>
      <Divider />
    </>
  );
};

export default InstrumentExpItem;
