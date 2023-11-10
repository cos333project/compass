import React, { ReactNode } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { DroppableProps } from '../types';

export function Droppable(props: DroppableProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: props.id,
  });

  const style = {
    color: isOver ? 'green' : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {props.children}
    </div>
  );
}
