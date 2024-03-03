import React, { useCallback } from 'react';

import { Box, Button, Space, Stack } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { type Control, useFieldArray } from 'react-hook-form';

import { type UserFormValues } from '@/components/model/UserForm/logics';
import InstrumentExpItem from '@/components/model/UserForm/parts/InstrumentExpItem';

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

  return (
    <Stack>
      {fields.map((field, index) => (
        <InstrumentExpItem key={field.id} control={control} index={index} onRemove={remove} />
      ))}
      <Box>
        <Button variant="outline" color="gray" onClick={handleClickAppend}>
          <IconPlus size={16} />
          <Space w={4} />
          追加
        </Button>
      </Box>
    </Stack>
  );
};

export default InstrumentExp;
