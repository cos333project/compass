import { SortableContext } from '@dnd-kit/sortable';

import Course from '../app/Course';
import Droppable from './Droppable';
import { SemesterBinProps } from '../types';

const SemesterBin = ({ id, className }) => {
  const courses = [
    {
      id: 1,
      catalog_number: '126',
      department_code: 'COS',
      title: 'Intro to Computer Science',
    },
    {
      id: 2,
      catalog_number: '226',
      department_code: 'COS',
      title: 'Data Structures & Algorithms',
    },
    {
      id: 3,
      catalog_number: '217',
      department_code: 'COS',
      title: 'Intro Programming Systems',
    },
    {
      id: 4,
      catalog_number: '333',
      department_code: 'COS',
      title: 'Advanced Programming Techniques',
    },
    {
      id: 5,
      catalog_number: '240',
      department_code: 'COS',
      title: 'Discrete Math for CS',
    },
    {
      id: 6,
      catalog_number: '484',
      department_code: 'COS',
      title: 'Natural Language Processing',
    },
  ];

  const courseIDs = courses.map((course) => course.catalog_number);
  return (
    <Droppable id={id} className={className}>
      <div className={`min-h-[200px] w-full md:w-[300px] bg-white p-4 m-2 rounded-xl border`}>
        <p className='font-bold text-lg text-center text-gray-700 mb-4'>Semester {id}</p>
        <SortableContext items={courseIDs}>
          {courses.map((course) => (
            <Course key={course.catalog_number} id={course.id} />
          ))}
        </SortableContext>
      </div>
    </Droppable>
  );
};

export default SemesterBin;
