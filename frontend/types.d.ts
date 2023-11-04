export interface Course {
  id: string;
  department_code: string;
  catalog_number: number;
  title: string;
}

export interface Semester {
  id: string;
  courses: Course[];
}

export interface DragDropContextProps {
  initialCourses: Course[];
}
