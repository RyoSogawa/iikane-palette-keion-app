import React, { type ComponentProps } from 'react';

import {
  DndContext as DnDKitContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

export type DnDContextProps = ComponentProps<typeof DnDKitContext>;

const DnDContext: React.FC<DnDContextProps> = ({ children, ...props }) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  return (
    <DnDKitContext sensors={sensors} collisionDetection={closestCenter} {...props}>
      {children}
    </DnDKitContext>
  );
};

export default DnDContext;
