// store/useSearchStore.ts
import { create } from 'zustand';

// Define the store's state structure and associated actions.
interface SearchStoreState {
  searchResults: Course[];
  setSearchResults: (results: Course[]) => void;
}

const useSearchStore = create<SearchStoreState>((set) => ({
  searchResults: [],
  setSearchResults: (results) => set({ searchResults: results }),
}));

export default useSearchStore;
