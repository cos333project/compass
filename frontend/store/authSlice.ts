import { create } from 'zustand';

import { AuthState } from '../types';

const useAuthStore = create<AuthState>((set) => ({
  user: undefined,
  isAuthenticated: null,
  setIsAuthenticated: (isAuthenticated: boolean) => set({ isAuthenticated }),
  checkAuthentication: async () => {
    try {
      const response = await fetch(`${process.env.BACKEND}/cas?action=authenticate`, {
        credentials: 'include',
      });
      const data = await response.json();
      set({
        isAuthenticated: data.authenticated,
        user: data.authenticated ? data.user : undefined,
      });
    } catch (error) {
      console.error('Error checking authentication:', error);
      set({ isAuthenticated: false, user: undefined });
    }
  },
  login: () => {
    window.location.href = `${process.env.BACKEND}/cas?action=login`;
  },
  logout: () => {
    window.location.href = `${process.env.BACKEND}/cas?action=logout`;
  },
}));

export default useAuthStore;
