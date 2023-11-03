import { create } from 'zustand';

type AuthState = {
  isLoggedIn: boolean;
  setIsLoggedIn: (status: boolean) => void;
};

const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  setIsLoggedIn: (status) => set({ isLoggedIn: status }),
}));

export default useAuthStore;
