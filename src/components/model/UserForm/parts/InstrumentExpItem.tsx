import React, { useCallback } from 'react';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button, Group, type SelectProps } from '@mantine/core';
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
      <ControlledSelect
        control={control}
        name={`UserParts.${index}.partIcon`}
        data={partIcons}
        w={130}
      />
      <ControlledTextInput
        control={control}
        name={`UserParts.${index}.remark`}
        placeholder="パート詳細や経験年数等について教えてね"
        flex="1"
      />
      <Button variant="subtle" color="red" size="xs" onClick={handleClickRemove}>
        <IconTrash aria-label="削除" size={18} />
      </Button>
    </Group>
  );
};

export default InstrumentExpItem;
