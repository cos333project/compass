import { useState, useEffect, FC, useCallback } from 'react';

import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { LRUCache } from 'typescript-lru-cache';

import { Course } from '@/types';

import useSearchStore from '@/store/searchSlice';

const searchCache = new LRUCache<string, Course[]>({
  maxSize: 50,
  entryExpirationTimeInMS: 1000 * 60 * 60 * 24,
});

function debounce(func, delay) {
  let inDebounce;
  return (...args) => {
    clearTimeout(inDebounce);
    inDebounce = setTimeout(() => func(...args), delay);
  };
}

const Search: FC = () => {
  const [query, setQuery] = useState<string>('');

  const { setSearchResults, searchResults, addRecentSearch, recentSearches, setError, setLoading } =
    useSearchStore((state) => ({
      setSearchResults: state.setSearchResults,
      searchResults: state.searchResults,
      addRecentSearch: state.addRecentSearch,
      recentSearches: state.recentSearches,
      setError: state.setError,
      setLoading: state.setLoading,
    }));

  useEffect(() => {
    setSearchResults(searchResults);
  }, [searchResults]);

  const search = async (searchQuery: string) => {
    // const cachedResults = searchCache.get(searchQuery);
    // if (cachedResults) {
    //   setSearchResults(cachedResults);
    //   return;
    // }

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

  const debouncedSearch = debounce(search, 500);

  function retrieveCachedSearch(search) {
    setSearchResults(searchCache.get(search));
  }

  useEffect(() => {
    if (query) {
      debouncedSearch(query);
    }
  }, [query]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
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
        />
      </div>
      <div className='mt-3'>
        <div className='text-xs font-semibold text-gray-500'>Recent searches:</div>
        <div className='flex overflow-x-auto py-2 space-x-2'>
          {recentSearches.map((search, index) => (
            <button
              key={index}
              className='bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium py-0.5 px-2 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300'
              onClick={() => retrieveCachedSearch(search)}
            >
              {search}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Search;
