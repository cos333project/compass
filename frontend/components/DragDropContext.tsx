import React, { useState } from 'react';
import Course from './Course';
import { Semester, DragDropContextProps, Course as CourseType } from '../types';
import SemesterBin from './SemesterBin';

const generateSemesters = (classYear: number): Semester[] => {
  const startYear = classYear - 1;
  const semesters: Semester[] = [];
  for (let year = startYear; year < classYear; ++year) {
    semesters.push({ id: `Fall ${year}`, courses: [] as CourseType[] });
    semesters.push({ id: `Spring ${year + 1}`, courses: [] as CourseType[] });
  }
  return semesters;
};

const DragDropContext: React.FC<DragDropContextProps> = ({ initialCourses }) => {
  const [courses, setCourses] = useState<CourseType[]>(initialCourses);
  const classYear = 2025; // TODO: Dynamically set to user's class year, 2025 for now
  const [semesters, setSemesters] = useState<Semester[]>(generateSemesters(classYear)); 

// Function to handle dragging start from both courses list and semesters
const onDragStart = (e: React.DragEvent, course: CourseType, originSemesterId: string) => {
  e.dataTransfer.setData('course', JSON.stringify(course));
  e.dataTransfer.setData('originSemesterId', originSemesterId);
};

// Function to handle course drop into a semester
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
  if (!originSemesterId) {
    setCourses(prevCourses => prevCourses.filter(course => course.id !== droppedCourse.id));
  }

  // If the course was dropped back into the available courses, add it back
  if (semesterId === 'availableCourses') {
    setCourses(prevCourses => [...prevCourses, droppedCourse]);
  }
};

  return (
    <div className="flex justify-center p-5">
        <div
          onDrop={e => onDrop(e, 'availableCourses')}
          onDragOver={e => e.preventDefault()}
          className="mr-5 p-2 border-dashed border-2 border-gray-300"
        >
          <h2 className="text-lg font-bold text-gray-700">Available Courses</h2>
          {/* {courses.map((course, index) => (
            <Course 
              key={course.id}
              style={{
                animation: `cascadeFadeIn 500ms ease-out forwards ${index * 100}ms`,
              }}
              course={course}
              onDragStart={onDragStart}
              originSemesterId=""
            />
          ))} */}
        </div>

        {/* Render semester bins */}
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

export default DragDropContext;
