// hooks/useCourseManagement.js
import { useState } from 'react';
import { CourseType, Semester } from '../../types';
import { generateSemesters } from '../utilities/GenerateSemesters';

export const useCourseManagement = (initialCourses: CourseType[], classYear: number) => {
  const [courses, setCourses] = useState<CourseType[]>(initialCourses);
  const [semesters, setSemesters] = useState<Semester[]>(generateSemesters(classYear));

  const handleDragStart = (event: React.DragEvent, course: CourseType, originSemesterId?: string) => {
    event.dataTransfer.setData('course', JSON.stringify(course));
    if (originSemesterId) {
      event.dataTransfer.setData('originSemesterId', originSemesterId);
    }
  };

  const handleDrop = (event: React.DragEvent, targetSemesterId: string) => {
    event.preventDefault();
    const droppedCourse = JSON.parse(event.dataTransfer.getData('course') || '{}') as CourseType;
    const originSemesterId = event.dataTransfer.getData('originSemesterId');

    setSemesters(prevSemesters =>
      prevSemesters.map(semester => {
        if (semester.id === targetSemesterId && !semester.courses.find(c => c.id === droppedCourse.id)) {
          return { ...semester, courses: [...semester.courses, droppedCourse] };
        }
        if (semester.id === originSemesterId) {
          return { ...semester, courses: semester.courses.filter(c => c.id !== droppedCourse.id) };
        }
        return semester;
      }),
    );

    if (!originSemesterId) {
      setCourses(prevCourses => prevCourses.filter(course => course.id !== droppedCourse.id));
    }

    if (targetSemesterId === 'availableCourses') {
      setCourses(prevCourses => [...prevCourses, droppedCourse]);
    }
  };

  // More complex state management logic can be implemented here...

  return { courses, semesters, handleDragStart, handleDrop, setCourses, setSemesters };
};
