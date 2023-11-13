import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { DraggableProps } from '../types';

export function Draggable(props: DraggableProps) {
  const { id, children } = props;
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
  } : undefined;

  return (
    <div className="w-full" ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children}
    </div>
  );
}
