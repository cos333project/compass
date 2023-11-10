export interface User {
  role: string;
  netId: string;
  universityId: string;
  email: string;
  firstName: string;
  lastName: string;
  classYear: number;
}

export interface CourseType {
  id: string;
  department_code: string;
  catalog_number: number;
  title: string;
  originSemesterId?: string;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>, course: CourseType, originSemesterId: string) => void;
  onDragEnd?: (e: React.DragEvent<HTMLDivElement>) => void;
}

export interface CourseProps {
  course: CourseType;
  index?: number;
  style?: React.CSSProperties;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>, course: CourseType, originSemesterId: string) => void;
  originSemesterId?: string;
  isDragging?: boolean;
}

export interface Semester {
  id: string;
  courses: CourseType[];
  isHovering?: boolean;
}

export interface SemesterBinProps {
  semester: Semester;
  className?: string;
  onDrop?: (event: DragEvent<HTMLDivElement>) => void;
  onDragStart?: (event: DragEvent<HTMLDivElement>) => void;
}

export interface DraggableProps {
  children: React.ReactNode;
  id: string;
}

export interface DroppableProps {
  children: React.ReactNode;
  id: string;
  onDrop?: (event: DragEvent<HTMLDivElement>) => void;
}

export interface DragDropContextProps {
  searchResults: CourseType[];
}

export interface DropdownMenuProps {
  setShowSettings: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface MenuItemProps {
  isActive: boolean;
  children: React.ReactNode;
}

export interface SettingsFormProps {
  closeSettings: () => void;
  onSaveSettings: (newMajor: string, newClassYear: string) => void;
  initialMajor: string;
  initialClassYear: string;
}

export interface UserProfileState {
  major: string;
  classYear: string;
}

export interface Planner {
  classYear: number | null;
  semesters: Record<string, Semester>;
  setClassYear: (classYear: number) => void;
  addCourseToSemester: (semesterId: string, course: CourseType) => void;
  removeCourseFromSemester: (semesterId: string, courseId: string) => void;
}
