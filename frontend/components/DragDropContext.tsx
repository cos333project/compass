// DragDropContext.js
import React, { useState } from 'react';
import Course from './Course';
import SemesterBin from './SemesterBin';

const DragDropContext = () => {
  // Initialize courses and semesters
  const [courses, setCourses] = useState([
    { id: 1, name: 'Mathematics' },
    { id: 2, name: 'Literature' },
    { id: 3, name: 'Science' },
  ]);
  const [semesters, setSemesters] = useState([
    { id: '2023-1', courses: [] },
    { id: '2023-2', courses: [] },
  ]);

  // Function to handle dragging start from both courses list and semesters
  const onDragStart = (e, course, originSemesterId = null) => {
    e.dataTransfer.setData('course', JSON.stringify(course));
    // If dragging from within a semester, store the origin semester id
    if (originSemesterId) {
      e.dataTransfer.setData('originSemesterId', originSemesterId);
    }
  };

  // Function to handle course drop into a semester
  const onDrop = (e, semesterId) => {
    e.preventDefault();
    const droppedCourse = JSON.parse(e.dataTransfer.getData('course'));
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
    <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
      <div
        onDrop={e => onDrop(e, 'availableCourses')}
        onDragOver={e => e.preventDefault()}
        style={{
          marginRight: '20px',
          padding: '10px',
          border: '1px dashed #ccc',
        }}
      >
        <h2>Available Courses</h2>
        {courses.map(course => (
          <Course key={course.id} course={course} onDragStart={onDragStart} />
        ))}
      </div>
      <div>
        <h2>Semesters</h2>
        {semesters.map(semester => (
          <SemesterBin
            key={semester.id}
            semester={semester}
            onDrop={onDrop}
            onDragStart={onDragStart}
          />
        ))}
      </div>
    </div>
  );
};

export default DragDropContext;

