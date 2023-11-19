// import { produce } from 'immer';
// import { cookies } from 'next/headers';
import { create } from 'zustand';
// import { persist } from 'zustand/middleware';

import { Profile } from '../types';

const useUserSlice = create<Profile>((set) => ({
  firstName: '',
  lastName: '',
  major: undefined,
  minors: [],
  classYear: '',
  netid: '',
  themeDarkMode: false,
  timeFormat24h: false,
  updateProfile: (updates) => set((state) => ({ ...state, ...updates })),

  fetchProfile: async () => {
    const abortController = new AbortController();
    try {
      const response = await fetch(`${process.env.BACKEND}/profile`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        signal: abortController.signal,
      });

      if (!response.ok) {
        console.error(`HTTP error! Status:`, response.status);
        // TODO: Add a toast or pop-up to gracefully inform user of the error.
      }

      const data = await response.json();
      set({
        firstName: data.first_name,
        lastName: data.last_name,
        major: data.major,
        minors: data.minors || [],
        classYear: data.classYear,
        timeFormat24h: data.timeFormat24h,
        themeDarkMode: data.themeDarkMode,
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      abortController.abort();
    }
  },
  updateSettings: async (updates) => {
    const csrfToken = cookies.get('csrfToken')?.value;
    const response = await fetch(`${process.env.BACKEND}/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CSRF-Token': csrfToken,
      },
      credentials: 'include',
      body: JSON.stringify(updates),
    });

    const updatedSettings = await response.json();
    set({ ...updatedSettings });
  },
}));

export default useUserSlice;
