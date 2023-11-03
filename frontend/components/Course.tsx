// Course.js
import React from 'react';

const Course = ({ course, onDragStart }) => {
  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, course)}
      style={{
        padding: '5px',
        margin: '5px',
        backgroundColor: '#f9f9f9',
        border: '1px solid #ccc',
        cursor: 'grab',
      }}
    >
      {course.name}
    </div>
  );
};

export default Course;

