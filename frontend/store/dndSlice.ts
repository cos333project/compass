// May not need this file
import { produce } from 'immer';
import { create } from 'zustand';

import { Planner, CourseType } from '../types';

import { generateSemestersRecord } from './../app/utilities/GenerateSemesters';

export const useAcademicPlannerStore = create<Planner>((set) => ({
  classYear: null,
  semesters: {},

  setClassYear: (classYear: number) =>
    set({ classYear, semesters: generateSemestersRecord(classYear) }),

  addCourseToSemester: (semesterId: string, course: CourseType) =>
    set(
      produce((state) => {
        const semester = state.semesters[semesterId];
        if (semester && !semester.courses.find((c: CourseType) => c.id === course.id)) {
          semester.courses.push(course);
        }
      })
    ),

  removeCourseFromSemester: (semesterId: string, courseID: string) =>
    set(
      produce((state) => {
        const semester = state.semesters[semesterId];
        if (semester) {
          semester.courses = semester.courses.filter((c: CourseType) => c.id !== courseID);
        }
      })
    ),
}));
