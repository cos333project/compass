import { create } from 'zustand';

import { AuthState } from '../types';

const useAuthStore = create<AuthState>((set) => ({
  user: undefined,
  isAuthenticated: null,
  setIsAuthenticated: (isAuthenticated: boolean) => set({ isAuthenticated }),
  checkAuthentication: async () => {
    try {
      const response = await fetch(`/authenticate`, {
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
    const nextUrl = encodeURIComponent(`${process.env.COMPASS}/dashboard`);
    window.location.href = `/login?next=${nextUrl}`;
  },
  logout: async () => {
    try {
      const response = await fetch(`/logout`, {
        credentials: 'include',
      });
      if (response.ok) {
        set({ isAuthenticated: false, user: undefined });
      } else {
        console.error('Logout failed:', response.statusText);
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
    window.location.href = `/`;
  },
}));

export default useAuthStore;
