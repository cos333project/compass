import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import Course from './Course'; // Combined Course and SortableItem component
import { SemesterBinProps } from '../types';

const SemesterBin: React.FC<SemesterBinProps> = ({ semester }) => {
  return (
    <div className={`min-h-[200px] w-full md:w-[300px] bg-white p-4 m-2 rounded-xl border transition-all duration-300 ease-in-out transform hover:-translate-y-1 shadow-xl hover:shadow-2xl`}>
      <p className="font-bold text-lg text-center text-gray-700 mb-4">{semester.id}</p>
      <SortableContext items={semester.courses} strategy={verticalListSortingStrategy}>
        {semester.courses.map(course => (
          <Course key={course.id} id={course.id} course={course} />
        ))}
      </SortableContext>
    </div>
  );
};

export default SemesterBin;
