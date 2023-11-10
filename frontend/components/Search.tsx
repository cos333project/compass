import { useState, useCallback, useEffect } from 'react';
import { For } from 'million/react';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import useSearchStore from '../store/searchSlice';
import Course from './Course';
import { CourseType } from '../types';
import { debounce } from 'lodash';
import { LRUCache } from 'typescript-lru-cache';
import { Draggable } from '../components/Draggable';

const searchCache = new LRUCache<string, CourseType[]>({
  maxSize: 50,
  entryExpirationTimeInMS: 1000 * 60 * 60 * 24 // 24 hours
});

const Search: React.FC = () => {
  const [query, setQuery] = useState<string>("");
  const [animatedItems, setAnimatedItems] = useState<Set<string>>(new Set());
  const {
    setSearchResults,
    searchResults,
    addRecentSearch,
    recentSearches,
    setError,
    loading,
    setLoading
  } = useSearchStore(state => state);
  
  useEffect(() => {
    setAnimatedItems(prevAnimatedItems => {
      const newAnimatedItems = new Set(prevAnimatedItems);
      searchResults.forEach(course => {
        if (!newAnimatedItems.has(course.id)) {
          newAnimatedItems.add(course.id);
        }
      });
      return newAnimatedItems;
    });
  }, [searchResults]);
  
  const debouncedSearch = useCallback(debounce(async (searchQuery: string) => {
    if (!searchQuery) return;

    if (searchCache.has(searchQuery)) {
      setSearchResults(searchCache.get(searchQuery) || []);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/search/?course=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data: { courses: CourseType[] } = await response.json();
        setSearchResults(data.courses);
        if (data.courses.length > 0) addRecentSearch(searchQuery);
      } else {
        setError(`Server returned ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      setError("There was an error fetching courses.");
      console.error("There was an error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  }, 1000), [setSearchResults, searchCache, setLoading, setError, addRecentSearch]);

  // Update the query state and trigger the debounced search function
  const handleSearch = useCallback((value: string) => {
    setQuery(value.trim());
    if (!value.trim()) return;
    debouncedSearch(value);
  }, [debouncedSearch]);
  
  const handleRecentSearchClick = (search: string) => {
    // Display dummy popup for now
    alert(`Displaying course information for: ${search}`);
    // In the future, you might open a modal or a dedicated component to show the course profile
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, course: CourseType) => {
    e.dataTransfer.setData('application/reactflow', JSON.stringify(course));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div>
      <label htmlFor="search" className="sr-only">Search courses</label>
      <div className="relative mt-2 rounded-lg shadow-sm">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
        <input
          type="text"
          name="search"
          id="search"
          className="block w-full py-1.5 pl-10 pr-3 text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
          placeholder="Search courses"
          autoComplete="off"
          onChange={e => handleSearch(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') handleSearch(query);
          }}
        />
      </div>
      {/* Recent Searches */}
      <div className="mt-3">
        <div className="text-xs font-semibold text-gray-500">Recent searches:</div>
        <div className="flex overflow-x-auto py-2 space-x-2">
          { /* Consider changing this to For block */ }
          {recentSearches.map((search, index) => (
            <button
              key={index} // Preferably use a more unique key if possible
              style={{
                animation: `cascadeFadeIn 500ms ease-out forwards ${index * 150}ms`,
              }}
              className="bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium py-0.5 px-2 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
              onClick={() => handleRecentSearchClick(search)}
            >
              {search}
            </button>
          ))}
        </div>
      </div>
      <div className="relative max-h-[400px] overflow-y-auto">
        {loading ? (
          // Center the loading spinner in the middle of the search box
          <div className="flex justify-center items-center h-full">
            <span className="loading loading-ring loading-lg text-gray-700"></span>
          </div>
        ) : searchResults.length > 0 ? (
          // Render the list of search results
          <ul className="divide-y divide-dashed hover:divide-solid">
            {searchResults.map((course, index) => (
              <li key={course.id}>
              <Draggable id={course.id}>
                <div onDragStart={(e) => handleDragStart(e, course)}>
                  <Course
                    course={course}
                    style={{
                      animation: `cascadeFadeIn 500ms ease-out forwards ${index * 150}ms`,
                    }}
                  />
                </div>
              </Draggable>
            </li>
            ))}
          </ul>
        ) : (
          // Display when no courses are found
          <div className="text-center py-4 text-gray-500">No courses found.</div>
        )}
      </div>
    </div>
  );
};

export default Search;
