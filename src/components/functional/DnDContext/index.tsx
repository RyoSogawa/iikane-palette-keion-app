import React, { type ComponentProps, useCallback } from 'react';

import {
  DndContext as DnDKitContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

export type DnDContextProps = Omit<
  ComponentProps<typeof DnDKitContext>,
  'sensors' | 'collisionDetection'
>;

const DnDContext: React.FC<DnDContextProps> = ({ children, onDragStart, onDragEnd, ...props }) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      onDragStart?.(event);
      document.body.classList.add('dragging');
    },
    [onDragStart],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      onDragEnd?.(event);
      document.body.classList.remove('dragging');
    },
    [onDragEnd],
  );

  return (
    <DnDKitContext
      {...props}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}
    </DnDKitContext>
  );
};

export default DnDContext;
