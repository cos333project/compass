import { useDroppable } from '@dnd-kit/core';

import { DroppableProps } from '../types';

const Droppable: React.FC<DroppableProps> = ({ id, children, className }) => {
  const {isOver, setNodeRef} = useDroppable({ id });

  console.log(`Item is over ${id}`);
  const style = {
    background: isOver ? 'lightgreen' : 'white',
  };

  return (
    <div ref={setNodeRef} className={className} style={style}>
      {children}
    </div>
  );
};

export default Droppable;
