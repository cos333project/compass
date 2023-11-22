import { CourseProps } from '../types';

// TODO: Is this file used anymore?
const CourseItem: React.FC<CourseProps> = ({ course }) => {
  // This component now just needs to handle the rendering of the course
  return (
    <div className='w-full p-5 rounded-lg hover:bg-gray-200 hover:shadow-md transition duration-300 ease-in-out cursor-pointer'>
      <div className='flex mb-3 rounded'>
        <h4 className='text-xs font-semibold text-black'>
          {course.department_code} {course.catalog_number}
        </h4>
      </div>
      <div className='text-sm text-gray-900'>{course.title}</div>
    </div>
  );
};

export default CourseItem;
