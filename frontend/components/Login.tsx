import { FC } from 'react';

import useAuthStore from '../store/authSlice';

export const Login: FC = () => {
  const login = useAuthStore((state) => state.login);
  return (
    <button
      className='-mx-4 block px-4 py-2 text-base font-semibold leading-6 text-[var(--system-text-color)]'
      onClick={login}
    >
      Log In
    </button>
  );
};
