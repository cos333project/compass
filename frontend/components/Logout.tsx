import { FC } from 'react';

import useAuthStore from '@/store/authSlice';

export const Logout: FC = () => {
  const logout = useAuthStore((state) => state.logout);

  return <button onClick={logout}>Log Out</button>;
};
