import React, { useCallback } from 'react';

import { Box, Button, Group, type SelectProps, Stack } from '@mantine/core';
import { type Control, useFieldArray } from 'react-hook-form';

import { type UserFormValues } from '@/components/model/UserForm/logics';
import ControlledSelect from '@/components/ui/ControlledSelect';
import ControlledTextInput from '@/components/ui/ControlledTextInput';
import { UserPartMap } from '@/constants/user-part';

const partIcons: SelectProps['data'] = Object.entries(UserPartMap).map(([value, label]) => ({
  value,
  label: label.name,
}));

export type InstrumentExpProps = {
  control: Control<UserFormValues>;
};

const InstrumentExp: React.FC<InstrumentExpProps> = ({ control }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'UserParts',
  });

  const handleClickAppend = useCallback(() => {
    append({
      id: Math.random().toFixed(10),
      order: fields.length + 1,
      partIcon: 'VOCAL',
      remark: '',
    });
  }, [append, fields.length]);

  const handleClickRemove = useCallback(
    (index: number) => () => {
      remove(index);
    },
    [remove],
  );

  return (
    <Stack>
      {fields.map((field, index) => (
        <Group key={field.id}>
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
          <Button variant="subtle" color="red" onClick={handleClickRemove(index)}>
            -
          </Button>
        </Group>
      ))}
      <Box>
        <Button variant="outline" color="gray" onClick={handleClickAppend}>
          追加
        </Button>
      </Box>
    </Stack>
  );
};

export default InstrumentExp;
