import { useState, useEffect } from 'react';
import { For, block } from 'million/react';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'

interface Course {
  title: string;
  subjectCode: string;
  catalogNumber: number;
  subjectName: string;
  // Do we need to add more?
}

// TODO: Implement some sort of LRU Cache system for better user quality
// TODO: If user queries "*" or ".", then return all courses
// TODO: Implement some sort of autocomplete system (Materials UI has some good templates)

const Search: React.FC = () => {
  const [query, setQuery] = useState<string>("");
  const [courses, setCourses] = useState<Course[]>([]);

  const searchCourses = async () => {
    try {
      const response = await fetch(`http://localhost:8000/search/?course=${query}`);
      if (response.ok) {
        const { courses }: { courses: Course[] } = await response.json();
        console.log(courses.map(course => `${course.subjectCode} ${course.catalogNumber}, ${course.title}`));
        setCourses(courses);
      } else {
        console.error(`Server return ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error("There was an error fetching courses:", error)
    }
  };

  const handleKeyDown = (user: React.KeyboardEvent<HTMLInputElement>) => {
    if (user.key === 'Enter') searchCourses();
  };

  return (
    <div>
      <label 
        htmlFor="search" className="block text-sm font-medium leading-6 text-gray-900">
      </label>
      <div className="relative mt-2 rounded-md shadow-sm">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
        <input
          type="text"
          name="search"
          id="search"
          className="mt-4 bg-white rounded-md shadow-lg block w-full py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          placeholder="Search courses"
          autoComplete="off"
          onChange={event => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      <ul className="max-h-[400px] pt-4 overflow-x-auto overflow-y-auto divide-x divide-dashed hover:divide-solid">
        {/* Slow way to do it: */}
        {courses.map((course: Course) => (
          <li key={`${course.subjectCode} ${course.catalogNumber}`}
            className="text-compass-blue hover:bg-gray-200 p-2">
            <span className="font-semibold">{course.subjectCode} {course.catalogNumber}</span>
            <span className="ml-2 text-sm"> {course.title}</span>
          </li>
        ))}

        {/* Faster way to do it :)) (not working): */}
        {/* <For each={courses}>
          {(course, _) => (
            <li key={`${course.subjectCode} ${course.catalogNumber}`} className="text-compass-blue p-2 hover:bg-gray-200">
              <span className="font-semibold">{course.subjectCode} {course.catalogNumber}</span>
              <span className="ml-2 text-sm"> {course.title}</span>
            </li>
          )}
        </For> */}
      </ul>
    </div>
  )
}

export default Search;
