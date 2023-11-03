// SemesterBin.js
import React from 'react';
import Course from './Course';

const SemesterBin = ({ semester, onDrop, onDragStart }) => {
  // ...existing implementation remains the same...

  return (
    <div
      onDrop={e => onDrop(e, semester.id)}
      onDragOver={e => e.preventDefault()}
      style={{
        minHeight: '200px',
        width: '300px',
        backgroundColor: '#f0f0f0',
        padding: '10px',
        margin: '10px',
        border: '1px dashed #000',
      }}
    >
      <p>Semester {semester.id}</p>
      {semester.courses.map(course => (
        <Course
          key={course.id}
          course={course}
          onDragStart={e => onDragStart(e, course, semester.id)}
        />
      ))}
    </div>
  );
};

export default SemesterBin;
