import { useState, useEffect } from 'react';

import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { LRUCache } from 'typescript-lru-cache';

import { Course } from '@/types';

import useSearchStore from '../store/searchSlice';

const searchCache = new LRUCache<string, Course[]>({
  maxSize: 50,
  entryExpirationTimeInMS: 1000 * 60 * 60 * 24,
});

const Search: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  // const [animatedItems, setAnimatedItems] = useState<Set<string>>(new Set());
  const {
    setSearchResults,
    searchResults,
    addRecentSearch,
    recentSearches,
    setError,
    // TODO: get rid of loading?: loading,
    setLoading,
  } = useSearchStore((state) => ({
    setSearchResults: state.setSearchResults,
    searchResults: state.searchResults,
    addRecentSearch: state.addRecentSearch,
    recentSearches: state.recentSearches,
    setError: state.setError,
    loading: state.loading,
    setLoading: state.setLoading,
  }));

  // Check search results data
  useEffect(() => {
    setSearchResults(searchResults);
  }, [searchResults, setSearchResults]);

  const search = async (searchQuery: string) => {
    // if (!searchQuery) return;

    const cachedResults = searchCache.get(searchQuery);
    if (cachedResults) {
      setSearchResults(cachedResults);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.BACKEND}/search/?course=${encodeURIComponent(searchQuery)}`
      );
      if (response.ok) {
        const data: { courses: Course[] } = await response.json();
        setSearchResults(data.courses);
        if (data.courses.length > 0) {
          addRecentSearch(searchQuery);
          searchCache.set(searchQuery, data.courses);
        }
      } else {
        setError(`Server returned ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      setError('There was an error fetching courses.');
      console.error('There was an error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update the query state to the current state in the search bar
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && query.trim().length > 0) {
      search(query);
    }
  };

  const handleRecentSearchClick = (searched: string) => {
    search(searched);
  };

  return (
    <div>
      <label htmlFor='search' className='sr-only'>
        Search courses
      </label>
      <div className='relative mt-2 rounded-lg shadow-sm'>
        <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
          <MagnifyingGlassIcon className='h-5 w-5 text-gray-400' aria-hidden='true' />
        </div>
        <input
          type='text'
          name='search'
          id='search'
          className='block w-full py-1.5 pl-10 pr-3 text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm'
          placeholder='Search courses'
          autoComplete='off'
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
      </div>
      {/* Recent Searches */}
      <div className='mt-3'>
        <div className='text-xs font-semibold text-gray-500'>Recent searches:</div>
        <div className='flex overflow-x-auto py-2 space-x-2'>
          {/* Consider changing this to For block */}
          {recentSearches.map((search, index) => (
            <button
              key={index} // Preferably use a more unique key if possible
              style={{
                animation: `cascadeFadeIn 500ms ease-out forwards ${index * 150}ms`,
              }}
              className='bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium py-0.5 px-2 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300'
              onClick={() => handleRecentSearchClick(search)}
            >
              {search}
            </button>
          ))}
        </div>
      </div>
      {/* <div className='relative max-h-[400px] overflow-y-auto'>
        {loading ? (
          // Center the loading spinner in the middle of the search box
          <div className='flex justify-center items-center h-full'>
            <span className='loading loading-ring loading-lg text-gray-700'></span>
          </div>
        ) : searchResults.length > 0 ? (
          // Render the list of search results
          <ul className='divide-y divide-dashed hover:divide-solid'>
            {searchResults.map((course, index) => (
              <li key={index}>
                <div className='w-full p-5 rounded-lg hover:bg-gray-200 hover:shadow-md transition duration-300 ease-in-out cursor-pointer'>
                  <div className='flex mb-3 rounded'>
                    <h4 className='text-xs font-semibold text-black'>
                      {course.department_code} {course.catalog_number}
                    </h4>
                  </div>
                  <div
                      className='text-sm text-gray-900'>{course.title}</div>
                </div>
              </li>
            ))}
          </ul> */}
    </div>
  );
};

export default Search;
