import { create } from 'zustand';

import { SearchStoreState } from '../types';

const useSearchStore = create<SearchStoreState>((set) => ({
  searchResults: [],
  activeDraggableCourse: null,
  recentSearches: [],
  error: null,
  loading: false,
  setSearchResults: (results) => set({ searchResults: results }),
  setActiveDraggableCourse: (course) => set({ activeDraggableCourse: course }),
  addRecentSearch: (query) => {
    let trimmedQuery = query.trim();
    if (trimmedQuery.length === 0) return;
    trimmedQuery = trimmedQuery.length > 120 ? trimmedQuery.slice(0, 120) : trimmedQuery;
    set((state) => {
      const updatedRecentSearches = [...new Set([trimmedQuery, ...state.recentSearches])].slice(0, 5);
      return { recentSearches: updatedRecentSearches };
    });
  },
  setError: (error) => set({ error }),
  setLoading: (loading) => set({ loading }),
}));

export default useSearchStore;
