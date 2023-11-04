import { useState, useCallback, useEffect } from 'react';
import { For } from 'million/react';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import useSearchStore from '../store/searchSlice';
import Course from '../components/Course';
import { Course as CourseType } from '../types';
import { debounce } from 'lodash';
import { LRUCache } from 'typescript-lru-cache';

const searchCache = new LRUCache<string, CourseType[]>({
  maxSize: 50,
  entryExpirationTimeInMS: 1000 * 60 * 60 * 24 // Cached searches expire after 24 hours
});

// TODO: If a course entered blatantly does not exist, we should display "No courses found."
// TODO: Implement some sort of LRU Cache system for better user quality
// TODO: If user queries "*" or ".", then return all courses (is there a way to do this faster?)
// TODO: For recent searches, allow up to 120 characters. Is there a better way to do this so design doesn't blow up?
// TODO: Implement some sort of autocomplete system (Materials UI has some good templates)
  // TODO: PRELOAD COURSES in the background per user session (as soon as they're logged in, not even to the dashboard yet) and autocomplete them super fast

const Search: React.FC = () => {
  const [query, setQuery] = useState<string>("");
  const [animatedItems, setAnimatedItems] = useState<Set<string>>(new Set());
  const { setSearchResults, searchResults, addRecentSearch, recentSearches, setError, loading, setLoading } = useSearchStore(state => ({
    setSearchResults: state.setSearchResults,
    searchResults: state.searchResults,
    addRecentSearch: state.addRecentSearch,
    recentSearches: state.recentSearches,
    setError: state.setError,
    loading: state.loading,
    setLoading: state.setLoading
  }));

  useEffect(() => {
    // Update the list of animated items when searchResults changes
    const newAnimatedItems = new Set(animatedItems);
    for (const course of searchResults) {
      if (!animatedItems.has(course.id)) {
        newAnimatedItems.add(course.id);
      }
    }
    setAnimatedItems(newAnimatedItems);
  }, [searchResults]);

  function updateCache(searchTerm: string, results: CourseType[]) {
    const cacheSizeLimit = 50;
    searchCache.set(searchTerm, results);
    if (searchCache.size > cacheSizeLimit) {
      const firstKey = searchCache.keys().next().value;
      searchCache.delete(firstKey);
    }
  }

  const debouncedSearchCourses = useCallback(debounce(async (searchQuery: string) => {
    if (!searchQuery) return;
    // TODO: Consider if user enters inappropriate things. Ideally, we don't display
    // these on the frontend. We have a few options:
    // 1. Use a thorough Regex check that would capture 99% of all bad words and phrases
    // 2. Record only CLICKED on courses, forcing that cache history consists only of valid courses
    // 2. Use a third-party API or library to check for profanity and the like
    // 3. Train or import a (pretrained or finetuned) machine learning model to detect profanity (might be more flexible)

    // Check if results are in the cache
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
        addRecentSearch(searchQuery);
        updateCache(searchQuery, data.courses);
      } else {
        setError(`Server returned ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      setError("There was an error fetching courses.");
      console.error("There was an error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  }, 2000), []);

  // Update the query state and trigger the debounced search function
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuery(value);
    debouncedSearchCourses(value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && query.trim().length > 0) {
      debouncedSearchCourses(query);
    }
  };

  const handleRecentSearchClick = (search: string) => {
    // Display dummy popup for now
    alert(`Displaying course information for: ${search}`);
    // In the future, you might open a modal or a dedicated component to show the course profile
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, course: CourseType) => {
    e.dataTransfer.setData('course', JSON.stringify(course));
    e.dataTransfer.setData('originSemesterId', ''); // Empty string to denote it's from the search results
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
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
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
            <Course
              key={course.id}
              style={{
                animation: `cascadeFadeIn 500ms ease-out forwards ${index * 150}ms`,
              }}
              course={course}
              originSemesterId="" // Empty since it's coming from search results
              onDragStart={(e) => handleDragStart(e, course)}
            />
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
