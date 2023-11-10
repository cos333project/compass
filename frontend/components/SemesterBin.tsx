import React from 'react';
import Course from './Course';
import { CourseType } from '../types';
import { Droppable } from './Droppable'; // Import your Droppable component

type SemesterBinProps = {
  semester: {
    id: string;
    courses: CourseType[];
  };
  onDropCourse: (course: CourseType, semesterId: string) => void; // Adjusted prop for handling course drop
};

const getSemesterColor = (id: string) => {
  // Function implementation
};

const SemesterBin: React.FC<SemesterBinProps> = ({ semester, onDropCourse }) => {
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const courseData = event.dataTransfer.getData('application/reactflow');
    const course = JSON.parse(courseData) as CourseType;
    onDropCourse(course, semester.id);
  };

  return (
    <Droppable id={semester.id} onDrop={handleDrop}>
      <div
      className={`min-h-[200px] w-full md:w-[300px] bg-white p-4 m-2 rounded-xl border transition-all duration-300 ease-in-out transform hover:-translate-y-1 shadow-xl hover:shadow-xll`}
      >
        <p className="font-bold text-lg text-center text-gray-700 mb-4">{semester.id}</p>
        {semester.courses.map((course, index) => (
          <Course
            key={course.id}
            style={{
              animation: `cascadeFadeIn 500ms ease-out forwards ${index * 100}ms`,
            }}
            course={course}
            originSemesterId={semester.id}
            // Ensure you handle the drag start event appropriately
          />
        ))}
      </div>
    </Droppable>
  );
};

export default SemesterBin;
