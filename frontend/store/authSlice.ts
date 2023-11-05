import { create } from 'zustand';

type User = {
  role: string;
  net_id: number;
  university_id: string;
  email: string;
  first_name: string;
  last_name: string;
  class_year: number;
};

type AuthState = {
  user?: User;
  isAuthenticated: boolean;
  checkAuthentication: () => Promise<void>;
  login: () => void;
  logout: () => Promise<void>;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
};

const useAuthStore = create<AuthState>((set) => ({
  user: undefined,
  isAuthenticated: false,
  setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  checkAuthentication: async () => {
    try {
      const response = await fetch('http://localhost:8000/authenticate', {
        credentials: 'include', // Necessary for cookies to be sent and received
      });
      const data = await response.json();
      if (data.authenticated) {
        // Assuming that the response will contain the user data if authenticated
        set({ isAuthenticated: true, user: data.user });
      } else {
        set({ isAuthenticated: false, user: undefined });
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      set({ isAuthenticated: false, user: undefined });
    }
  },
  login: () => {
    window.location.href = 'http://localhost:8000/login';
  },
  logout: async () => {
    try {
      await fetch('http://localhost:8000/logout', {
        credentials: 'include',
      });
      set({ isAuthenticated: false, user: undefined });
      // Redirect to the home page after logout
      window.location.href = '/';
    } catch (error) {
      console.error('Error during logout:', error);
    }
  },
}));

export default useAuthStore;
