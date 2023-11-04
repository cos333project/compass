import React from 'react';
import { Course as CourseType } from '../types';

// Define the shape of the course object and the onDragStart function
type CourseProps = {
  course: CourseType;
  style: { animation: string; } | { animation?: undefined };
  originSemesterId: string;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, course: CourseType, originSemesterId: string) => void;
};

const CourseItem: React.FC<CourseProps> = ({ course, originSemesterId, onDragStart }) => {
  return (
    <div 
      className="w-full p-5 rounded-lg hover:bg-gray-200 hover:shadow-md transition duration-300 ease-in-out cursor-pointer"
      draggable 
      onDragStart={event => onDragStart(event, course, originSemesterId)}
    >
      <div className="flex mb-3 rounded">
        {/* Use text-black for the text color and text-xs for a slightly smaller font size */}
        <h4 className="text-xs font-semibold text-black">{course.department_code} {course.catalog_number}</h4>
      </div>
      {/* Use text-gray-900 to ensure the title is clearly visible */}
      <div className="text-sm text-gray-900">{course.title}</div>
    </div>
  );
};

export default CourseItem;
