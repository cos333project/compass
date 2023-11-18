import { create } from 'zustand';
import { useEffect } from 'react';

type UserState = {
  firstName: string;
  lastName: string;
  major: string;
  minors: string;
  classYear: string;
  timeFormat24h: boolean;
  themeDarkMode: boolean;
  update: (updates: Partial<UserState>) => void;
};

export type SettingsProps = {
  settings: UserState;
  onClose: () => void;
  onSave: (settings: UserState) => void;
};

const useUserSlice = create<UserState>((set) => ({
  firstName: '',
  lastName: '',
  major: '',
  minors: '',
  classYear: '2025',
  timeFormat24h: false,
  themeDarkMode: false,
  update: (updates) => set((state) => ({ ...state, ...updates })),
}));

// Custom hook for fetching user data
export const useFetchUserProfile = () => {
  const updateStore = useUserSlice((state) => state.update);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(process.env.BACKEND + '/profile', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        updateStore({
          firstName: data.first_name,
          lastName: data.last_name,
          major: data.major,
          minors: data.minors,
          classYear: data.class_year,
          timeFormat24h: data.timeFormat24h,
          themeDarkMode: data.themeDarkMode,
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, [updateStore]);
};

export default useUserSlice;
