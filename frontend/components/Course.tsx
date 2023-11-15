import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import Draggable from './Draggable';
import { CourseProps } from '../types';

const Course: React.FC<CourseProps> = ({ id, course }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id });

  const combinedStyle = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <Draggable id={id} className="p-5 rounded-lg hover:bg-gray-200 hover:shadow-md hover:-translate-y-1 transition duration-300 ease-in-out cursor-pointer" style={combinedStyle}>
      <div ref={setNodeRef} {...attributes} {...listeners} className="flex mb-3 rounded">
        <h4 className="text-xs font-semibold text-black">{course.department_code} {course.catalog_number}</h4>
      </div>
      <div className="text-sm text-gray-900 text-left">{course.title}</div>
    </Draggable>
  );
};

export default Course;
