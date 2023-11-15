import { useState, useEffect } from 'react';

import { DndContext, DragEndEvent } from '@dnd-kit/core';

import { generateSemesters } from './../app/utilities/GenerateSemesters';
import SemesterBin from './SemesterBin';
import { useAcademicPlannerStore } from '../store/dndSlice';
import useSearchStore from '../store/searchSlice';
import { Semester } from '../types';

const Canvas: React.FC = () => {
  const { addCourseToSemester } = useAcademicPlannerStore();
  const { searchResults } = useSearchStore();
  const classYear = 2025; // Replace with actual dynamic value
  const [localSemesters, setLocalSemesters] = useState<Semester[]>([]);

  useEffect(() => {
    setLocalSemesters(generateSemesters(classYear));
  }, [classYear]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over) {
      const draggedCourseId = active.id.toString();
      const targetSemesterId = over.id.toString();
      const draggedCourse = searchResults.find(course => course.id === draggedCourseId);
      
      if (draggedCourse) {
        addCourseToSemester(targetSemesterId, draggedCourse); // Update global state
        // Also update local state to reflect changes
        // You'll need to implement logic here to update `localSemesters` based on the drag and drop action
      }
    }
  };

  return (
      <div className="grid grid-cols-4 md:grid-cols-2 gap-2 p-5">
        {localSemesters.map((semester) => (
          <SemesterBin key={semester.id} semester={semester} className="semester-bin-style" />
        ))}
      </div>
  );
};

export default Canvas;
