import React, { useCallback } from 'react';

import { type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Box, Button, Space, Stack } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { type Control, useFieldArray } from 'react-hook-form';

import DnDContext from '@/components/functional/DnDContext';
import { type UserFormValues } from '@/components/model/UserForm/logics';
import InstrumentExpItem from '@/components/model/UserForm/parts/InstrumentExpItem';

export type InstrumentExpProps = {
  control: Control<UserFormValues>;
};

const InstrumentExp: React.FC<InstrumentExpProps> = ({ control }) => {
  const { fields, append, remove, move } = useFieldArray({
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

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!!over && active.id !== over.id) {
        const fromIndex = fields.findIndex((field) => field.id === active.id);
        const toIndex = fields.findIndex((field) => field.id === over.id);
        move(fromIndex, toIndex);
      }
    },
    [fields, move],
  );

  return (
    <Stack>
      <DnDContext onDragEnd={handleDragEnd}>
        <SortableContext items={fields} strategy={verticalListSortingStrategy}>
          {fields.map((field, index) => (
            <InstrumentExpItem
              key={field.id}
              id={field.id}
              control={control}
              index={index}
              onRemove={remove}
            />
          ))}
        </SortableContext>
      </DnDContext>
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
