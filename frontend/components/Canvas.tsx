import React, { useState } from 'react';
import { Semester, DragDropContextProps, CourseType } from '../types';
import SemesterBin from './SemesterBin';
import { generateSemesters } from '@/app/utilities/GenerateSemesters';

const Canvas: React.FC<DragDropContextProps> = () => {
  // Assuming courses are initially fetched or passed down from a parent component.
  const [courses, setCourses] = useState<CourseType[]>([]); // Initialize with an empty array
  const classYear = 2025; // TODO: Dynamically set to user's class year
  const [semesters, setSemesters] = useState<Semester[]>(generateSemesters(classYear)); 

  const onDragStart = (e: React.DragEvent, course: CourseType, originSemesterId: string) => {
    e.dataTransfer.setData('course', JSON.stringify(course));
    e.dataTransfer.setData('originSemesterId', originSemesterId);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>, semesterId: string) => {
    e.preventDefault();
    const droppedCourse = JSON.parse(e.dataTransfer.getData('course') || '{}') as CourseType;
    const originSemesterId = e.dataTransfer.getData('originSemesterId');

    // Adding to a semester
    setSemesters(prevSemesters =>
      prevSemesters.map(semester => {
        if (semester.id === semesterId) {
          // Avoid duplicates
          if (!semester.courses.find(c => c.id === droppedCourse.id)) {
            return { ...semester, courses: [...semester.courses, droppedCourse] };
          }
        }
        // Remove from previous semester if it was moved from another semester
        if (semester.id === originSemesterId) {
          return { ...semester, courses: semester.courses.filter(c => c.id !== droppedCourse.id) };
        }
        return semester;
      }),
    );

    // If the course was not dragged from a semester, remove it from the available list
    if (originSemesterId === 'availableCourses') {
      setCourses(prevCourses => prevCourses.filter(course => course.id !== droppedCourse.id));
    }
  };

  return (
    <div className="grid grid-cols-4 md:grid-cols-2 gap-2 p-5">
      {semesters.map((semester) => (
        <SemesterBin
          key={semester.id}
          semester={semester}
          onDrop={onDrop}
          onDragStart={onDragStart}
        />
      ))}
    </div>
  );
};

export default Canvas;
