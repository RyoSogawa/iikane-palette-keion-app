import React, { useCallback } from 'react';

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
  control: Control<UserFormValues>;
  index: number;
  onRemove: (index: number) => void;
};

const InstrumentExpItem: React.FC<InstrumentExpItemProps> = ({ control, index, onRemove }) => {
  const handleClickRemove = useCallback(() => {
    onRemove(index);
  }, [onRemove, index]);

  return (
    <Group>
      <IconGripVertical aria-label="ドラッグアンドドロップで並び替える" size={22} />
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
