import { create } from 'zustand';
import { CourseType } from '../types';

interface SearchStoreState {
  searchResults: CourseType[];
  setSearchResults: (results: CourseType[]) => void;
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
  error: string | null;
  setError: (error: string | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const useSearchStore = create<SearchStoreState>((set) => ({
  searchResults: [],
  recentSearches: [],
  error: null,
  loading: false,
  setSearchResults: (results) => set({ searchResults: results }),
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
