import React, { useState } from 'react';
import { Semester, DragDropContextProps, CourseType } from '../types';
import SemesterBin from './SemesterBin';
import { generateSemesters } from '@/app/utilities/GenerateSemesters';
import useSearchStore from '@/store/searchSlice';
import Course from './Course';
import { DndContext, DragOverlay, DragStartEvent, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

const Canvas = () => {
  const { searchResults, setSearchResults } = useSearchStore();
  const classYear = 2025;
  const [semesters, setSemesters] = useState<Semester[]>(generateSemesters(classYear)); 
  
  function handleDragEnd(event: DragEndEvent) {
    console.log("Drag end called");
    const {active, over} = event;
    console.log("ACTIVE: " + active.id);
    console.log("OVER :" + over.id);

    if(active.id !== over.id) {
      setSearchResults((items) => {
        const activeIndex = items.indexOf(active.id);
        const overIndex = items.indexOf(over.id);
        console.log(arrayMove(items, activeIndex, overIndex));
        return arrayMove(items, activeIndex, overIndex);
        // items: [2, 3, 1]   0  -> 2
        // [1, 2, 3] oldIndex: 0 newIndex: 2  -> [2, 3, 1] 
      });
      
    }
  }

  return (
    <div className="grid grid-cols-4 md:grid-cols-2 gap-2 p-5">
      {semesters.map(semester => (
        <SortableContext key={semester.id} items={searchResults} strategy={verticalListSortingStrategy}>
          <SemesterBin semester={semester}>
            {searchResults.map(course => (
              <Course key={course} id={course}/>
            ))}
          </SemesterBin>
        </SortableContext>
      ))}
    </div>
  );
};

export default Canvas;

