import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

import { DraggableProps } from '../types';

const Draggable: React.FC<DraggableProps> = ({ id, children, className, style }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
  const combinedStyle = {
    ...style,
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div className={className} ref={setNodeRef} style={combinedStyle} {...listeners} {...attributes}>
      {children}
    </div>
  );
}

export default Draggable;
