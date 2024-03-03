import React, { useCallback } from 'react';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Box, Button, Space, Stack } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { type Control, useFieldArray } from 'react-hook-form';

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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!!over && active.id !== over.id) {
        move(
          Number(active.data.current?.sortable.index),
          Number(over.data.current?.sortable.index),
        );
      }
    },
    [move],
  );

  return (
    <Stack>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
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
      </DndContext>
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
