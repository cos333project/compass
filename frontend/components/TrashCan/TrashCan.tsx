import { useDroppable, UniqueIdentifier } from '@dnd-kit/core';
import './TrashCan.module.scss';

export type TrashCanProps = {
  id: UniqueIdentifier;
};

export const TrashCan: React.FC<TrashCanProps> = ({ id }) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div ref={setNodeRef} className={`trash-container ${isOver ? 'is-over' : ''}`}>
      Drop here to delete
    </div>
  );
};
