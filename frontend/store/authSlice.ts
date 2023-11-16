import { create } from 'zustand';

import { User } from '../types';

type AuthState = {
  user?: User;
  isAuthenticated: boolean | null;
  checkAuthentication: () => Promise<void>;
  login: () => void;
  logout: () => Promise<void>;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
};

const useAuthStore = create<AuthState>((set) => ({
  user: undefined,
  isAuthenticated: null,
  setIsAuthenticated: (isAuthenticated: boolean) => set({ isAuthenticated }),
  checkAuthentication: async () => {
    try {
      const response = await fetch('http://localhost:8000/authenticate/', {
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
    const nextUrl = encodeURIComponent('http://localhost:3000/dashboard/');
    window.location.href = `http://localhost:8000/login?next=${nextUrl}`;
  },
  logout: async () => {
    try {
      const response = await fetch('http://localhost:8000/logout/', {
        credentials: 'include',
      });

      console.log(response.ok);
      if (response.ok) {
        set({ isAuthenticated: false, user: undefined });
      } else {
        console.error('Logout failed:', response.statusText);
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
    window.location.href = 'http://localhost:3000';
  },
}));

export default useAuthStore;
