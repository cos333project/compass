import { devtools } from 'zustand/middleware';

export interface Settings {
  firstName: string;
  lastName: string;
  major?: string;
  minors: string[];
  timeFormat24h: boolean;
  themeDarkMode: boolean;
}

export interface SettingsProps {
  settings: Settings;
  onClose: () => void;
  onSave: (updatedSettings: Settings) => void;
}

export interface SettingsModalProps {
  children: React.ReactNode;
  onClose: () => void;
}

export interface SelectFieldProps {
  label: string;
  options: string[];
  value: string | string[] | undefined ;
  onChange: (value: string | string[] | undefined) => void;
  multiple?: boolean;
}

export interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
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

export interface SearchStoreState {
  searchResults: CourseType[];
  setSearchResults: (results: CourseType[]) => void;
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
  activeDraggableCourse: CourseType | null;
  setActiveDraggableCourse: (course: CourseType | null) => void;
  error: string | null;
  setError: (error: string | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export interface CourseProps {
  id: number;
  course?: CourseType;
}

export interface Semester {
  id: string;
  courses: CourseType[];
}

export interface SemesterBinProps {
  children?: React.ReactNode;
  semester: Semester;
  className?: string;
}

export interface DraggableProps {
  id: number;
  children: React.ReactNode;
  className?: string;
  style?: CSSProperties;
}

export interface DroppableProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export interface DndState {
  semesters: Semester[];
  addCourseToSemester: (course: CourseType, semesterId: string) => void;
  moveCourseWithinSemester: (courseID: string, oldIndex: number, newIndex: number) => void;
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
  onClick: () => void;
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
