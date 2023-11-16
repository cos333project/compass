import { Semester, Course } from '../../types';

export const generateSemesters = (classYear: number): Semester[] => {
  const startYear = classYear - 4;
  const semesters: Semester[] = [];

  for (let year = startYear; year < classYear; ++year) {
    semesters.push({ id: `Fall ${year}`, courses: [] as Course[] });
    semesters.push({ id: `Spring ${year + 1}`, courses: [] as Course[] });
  }

  return semesters;
};

export const generateSemestersRecord = (classYear: number): Record<string, Semester> => {
  const startYear = classYear - 4;
  const semesters: Record<string, Semester> = {};

  for (let year = startYear; year < classYear; ++year) {
    semesters[`Fall ${year}`] = {
      id: `Fall ${year}`,
      courses: [] as Course[],
    };
    semesters[`Spring ${year + 1}`] = {
      id: `Spring ${year + 1}`,
      courses: [] as Course[],
    };
  }

  return semesters;
};
