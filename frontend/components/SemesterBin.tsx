import React from 'react';
import Course from './Course';
import { Course as CourseType } from '../types';

type SemesterBinProps = {
  semester: {
    id: string;
    courses: CourseType[];
  };
  onDrop: (event: React.DragEvent<HTMLDivElement>, semesterId: string) => void;
  onDragStart: (event: React.DragEvent<HTMLDivElement>, course: CourseType, semesterId: string) => void;
};

const getSemesterColor = (id: string) => {
  // This function would return a color based on the semester id
  // For example, fall could be a warm color, spring could be a cool color, etc.
};

const SemesterBin: React.FC<SemesterBinProps> = ({ semester, onDrop, onDragStart }) => {
  const semesterColor = getSemesterColor(semester.id);

  return (
    <div
      onDrop={e => {
        e.preventDefault();
        onDrop(e, semester.id);
      }}
      onDragOver={e => {
        e.preventDefault();
        e.currentTarget.style.backgroundColor = '#f4f4f4'; // Highlight on drag over
      }}
      onDragLeave={e => {
        e.currentTarget.style.backgroundColor = ''; // Remove highlight on drag leave
      }}
      style={{ boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }} // Add shadow for depth
      className={`min-h-[200px] w-full md:w-[300px] bg-white p-4 m-2 rounded-lg border transition-all duration-300 ease-in-out ${semesterColor}`}
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
          onDragStart={onDragStart}
        />
      ))}
    </div>
  );
};

export default SemesterBin;
