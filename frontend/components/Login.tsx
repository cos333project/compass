import useAuthStore from '../store/authSlice';

export const Login: React.FC = () => {
  const login = useAuthStore((state) => state.login);
  return (
    <button 
      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[var(--system-text-color)]"
      onClick={login}>
      Log In
    </button>
  );
};
