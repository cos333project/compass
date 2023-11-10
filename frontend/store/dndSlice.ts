import { generateSemestersRecord } from './../app/utilities/GenerateSemesters';
import { create } from 'zustand';
import { Planner, CourseType } from '../types';

export const useAcademicPlannerStore = create<Planner>(set => ({
  // Initial State
  classYear: null,
  semesters: {},

  // Actions
  setClassYear: (classYear: number) => {
    set({ classYear, semesters: generateSemestersRecord(classYear) });
  },

  addCourseToSemester: (semesterId: string, course: CourseType) => set(state => {
    const updatedSemesterCourses = new Set([...state.semesters[semesterId].courses, course]);
    return {
      semesters: {
        ...state.semesters,
        [semesterId]: { ...state.semesters[semesterId], courses: Array.from(updatedSemesterCourses) }
      }
    };
  }),

  removeCourseFromSemester: (semesterId: string, courseId: string) => set(state => {
    const updatedSemesterCourses = state.semesters[semesterId].courses.filter(c => c.id !== courseId);
    return {
      semesters: {
        ...state.semesters,
        [semesterId]: { ...state.semesters[semesterId], courses: updatedSemesterCourses }
      }
    };
  }),
}));
