import React, { useCallback } from 'react';

import { Box, Button, Group, Stack } from '@mantine/core';
import { type Control, useFieldArray } from 'react-hook-form';

import { type UserFormValues } from '@/components/model/UserForm/logics';
import ControlledSelect from '@/components/ui/ControlledSelect';
import ControlledTextInput from '@/components/ui/ControlledTextInput';
import { UserPartMap } from '@/constants/user-part';

const partIcons = Object.entries(UserPartMap).map(([value, label]) => ({
  value,
  label: label.name,
}));

export type InstrumentExpProps = {
  control: Control<UserFormValues>;
};

const InstrumentExp: React.FC<InstrumentExpProps> = ({ control }) => {
  const { fields, append } = useFieldArray({
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

  return (
    <Stack>
      {fields.map((field, index) => (
        <Group key={field.id}>
          <ControlledSelect
            control={control}
            name={`UserParts.${index}.partIcon`}
            data={partIcons}
          />
          <ControlledTextInput
            control={control}
            name={`UserParts.${index}.remark`}
            placeholder="パートの詳細や経験年数等について教えてね"
            flex="1"
          />
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
