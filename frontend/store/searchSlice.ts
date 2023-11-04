import { create } from 'zustand';
import { Course } from '../types';

interface SearchStoreState {
  allCourses: Course[];
  preloadCourses: () => Promise<void>;
  searchResults: Course[];
  setSearchResults: (results: Course[]) => void;
  recentSearches: string[]; // Corrected type
  addRecentSearch: (query: string) => void;
  error: string | null;
  setError: (error: string | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  isPreloaded: boolean;
}

const useSearchStore = create<SearchStoreState>((set, get) => ({
  allCourses: [],
  searchResults: [],
  recentSearches: [],
  error: null,
  loading: false,
  isPreloaded: false,
  setSearchResults: (results) => set({ searchResults: results }),
  addRecentSearch: (query) => {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length === 0) {
      return; // Don't add empty or whitespace-only queries
    }
    set((state) => ({
      recentSearches: Array.from(new Set([...state.recentSearches, trimmedQuery])).slice(-5)
    }));
  },
  setError: (error) => set({ error }),
  setLoading: (loading) => set({ loading }),
  preloadCourses: async () => {
    if (get().isPreloaded) return; // Check if already preloaded
    set({ loading: true, error: null });
    try {
      const response = await fetch('http://localhost:8000/search/?course=*');
      if (response.ok) {
        const data = await response.json();
        set({ allCourses: data.courses, isPreloaded: true });
      } else {
        set({ error: `Server returned ${response.status}: ${response.statusText}` });
      }
    } catch (error) {
      set({ error: "There was an error fetching the full course list" });
    } finally {
      set({ loading: false });
    }
  },
}));

export default useSearchStore;
