import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CourseProps } from '../types';

const Course: React.FC<CourseProps & { id: string }> = ({ id, course }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div 
        className="p-5 rounded-lg hover:bg-gray-200 hover:shadow-md hover:-translate-y-1 transition duration-300 ease-in-out cursor-pointer"
      >
        <div className="flex mb-3 rounded">
          <h4 className="text-xs font-semibold text-black">{course.department_code} {course.catalog_number}</h4>
        </div>
        <div className="text-sm text-gray-900 text-left">{course.title}</div>
      </div>
    </div>
  );
};

export default Course;
