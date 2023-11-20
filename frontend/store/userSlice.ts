import { create } from 'zustand';
import { useEffect }  from 'react';

import { Profile } from '../types';

const useUserSlice = create<Profile>((set) => ({
  firstName: '',
  lastName: '',
  major: undefined,
  minors: [],
  class_year: undefined,
  netId: '',
  universityId: '',
  email: '',
  department: '',
  themeDarkMode: false,
  timeFormat24h: false,
  updateProfile: (updates) => set((state) => ({ ...state, ...updates })),
}));


// Custom hook for fetching user data
export const useFetchUserProfile = () => {
  const updateStore = useUserSlice((state) => state.updateProfile);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${process.env.BACKEND}/profile`, {
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
          class_year: data.class_year, // set timeFormat24h and themeDarkMode
        });

      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, [updateStore]);
};


export default useUserSlice;
