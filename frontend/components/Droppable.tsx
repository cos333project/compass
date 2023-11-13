import { useDroppable } from '@dnd-kit/core';
import { DroppableProps } from '../types';

export function Droppable(props: DroppableProps) {
  const {isOver, setNodeRef} = useDroppable({
    id: 'droppable',
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
