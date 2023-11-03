import { useState, useEffect } from 'react';
import { For, block } from 'million/react';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import useSearchStore from '../store/searchOutput';

type Course = {
  id: string;
  department_code: string;
  catalog_number: string;
  title: string;
  distribution_area_short: string;
  // ... any other properties
};

// TODO: Implement some sort of LRU Cache system for better user quality
// TODO: If user queries "*" or ".", then return all courses
// TODO: Implement some sort of autocomplete system (Materials UI has some good templates)

const Search: React.FC = () => {
  const [query, setQuery] = useState<string>("");
  const setSearchResults = useSearchStore((state) => state.setSearchResults);
  const searchResults = useSearchStore((state) => state.searchResults); // Assuming your store has a searchResults array
  const [recent, setPast] = useState<string[]>([]);
  
  const searchCourses = async () => {
    try {
      const response = await fetch(`http://localhost:8000/search/?course=${query}`);
      if (response.ok) {
        const data: { courses: Course[] } = await response.json();
        // Here we update the store with the search results
        setSearchResults(data.courses);
      } else {
        console.error(`Server returned ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error("There was an error fetching courses:", error);
    }
    // Update recent searches logic
    setPast((prevRecent) => {
      const updatedRecent = [...prevRecent, query];
      return updatedRecent.length > 5 ? updatedRecent.slice(1) : updatedRecent;
    });
  };

  const handleKeyDown = (user: React.KeyboardEvent<HTMLInputElement>) => {
    if (user.key === 'Enter') searchCourses();
  };

  // return (
  //   <div>
  //     <label 
  //       htmlFor="search" className="block text-sm font-medium leading-6 text-gray-900">
  //     </label>
  //     <div className="relative mt-2 rounded-lg shadow-sm">
  //       <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
  //         <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
  //       </div>
  //       <input
  //         type="text"
  //         name="search"
  //         id="search"
  //         className="mt-4 bg-white rounded-lg shadow-lg block w-full py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
  //         placeholder="Search courses"
  //         autoComplete="off"
  //         onChange={event => setQuery(event.target.value)}
  //         onKeyDown={handleKeyDown}
  //       />
  //     </div>
  //     <div className="pt-2"></div>
  //     <ul className="max-h-[400px] overflow-x-auto overflow-y-auto divide-dashed hover:divide-solid">
  //       {/* {courses.map((course: Course) => (
  //         <li key={`${course.department_code}${course.catalog_number}`} className="text-compass-blue hover:bg-gray-200 p-2">
  //           <div className="ml-2 font-semibold">{course.department_code} {course.catalog_number}</div>
  //       {courses.map((course: Course) => (
  //         <li key={`${course.department_code}${course.catalog_number}`} className="text-compass-blue hover:bg-gray-200 p-2">
  //           <div className="ml-2 font-semibold">{course.department_code}{course.catalog_number}</div>
  //           <div className="ml-2 text-sm">{course.title}</div>
  //           <div className="ml-2 text-sm">{course.distribution_area_short}</div>
  //         </li>
  //       ))}
  //     </ul>   

  //     <ul>
  //       <div> Recent Searches </div>
  //       <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  //         {recent[0]}
  //       </button>
  //       <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  //         {recent[1]}
  //       </button>
  //       <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  //         {recent[2]}
  //       </button>
  //       <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  //         {recent[3]}
  //       </button>
  //       <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  //         {recent[4]}
  //       </button>
        
  //       ))} */}

  //       {/* Faster way to do it :)) (not working): */}
  //       <For each={courses}>
  //         {(course) => (
  //           <li key={`${course.department_code}${course.catalog_number}`} className="text-compass-blue hover:bg-gray-200 p-2">
  //             <div className="ml-2 font-semibold">{course.department_code} {course.catalog_number}</div>
  //             <div className="ml-2 text-sm">{course.title}</div>
  //             <div className="ml-2 text-sm">{course.distribution_area_short}</div>
  //           </li>
  //         )}
  //       </For>
  //     </ul>
  //   </div>
  // )
  return (
  <div>
    <label htmlFor="search" className="block text-sm font-medium leading-6 text-gray-900"></label>
    <div className="relative mt-2 rounded-lg shadow-sm">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
      </div>
      <input
        type="text"
        name="search"
        id="search"
        className="mt-4 bg-white rounded-lg shadow-lg block w-full py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        placeholder="Search courses"
        autoComplete="off"
        onChange={event => setQuery(event.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
    <div className="pt-2"></div>
    <ul className="max-h-[400px] overflow-x-auto overflow-y-auto divide-dashed hover:divide-solid">
  {/* Map over searchResults array to render each course */}
      {searchResults.map((course: Course) => (
        <li key={`${course.department_code}${course.catalog_number}`} className="text-compass-blue hover:bg-gray-200 p-2">
          <div className="ml-2 font-semibold">{course.department_code} {course.catalog_number}</div>
          <div className="ml-2 text-sm">{course.title}</div>
          <div className="ml-2 text-sm">{course.distribution_area_short}</div>
        </li>
      ))}
    </ul>
  </div>
  )
}

export default Search;
