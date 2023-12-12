import { memo, FC } from 'react';

import { Dialog } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

import useAuthStore from '../store/authSlice';
import useMobileMenuStore from '../store/mobileMenuSlice';

import DropdownMenu from './DropdownMenu';
import { Login } from './Login';

const navigation = [
  { name: 'About', href: '/' },
  { name: 'Dashboard', href: '/dashboard/' }, // Should be protected path and not auto-redirect
  { name: 'Contact Us', href: '/' },
];

const Navbar: FC = () => {
  const { isAuthenticated, login } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    login: state.login,
  }));
  console.log('Navbar component rendering, isAuthenticated:', isAuthenticated);
  const { mobileMenuOpen, setMobileMenuOpen } = useMobileMenuStore();

  const handleDashboardClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // TODO: Change this to a proper route guard instead of onclick event
    e.preventDefault();
    login();
  };

  // FIXME: Commenting out for now since we need to build successfully.
  // const handleUserSettingsClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
  //   // Logic to open User Settings goes here
  //   console.log('User Settings Clicked');

  //   // e.g., navigate to the user settings page or open a settings modal
  // };

  const renderUserMenu = () => (isAuthenticated ? <DropdownMenu /> : <Login />);
  // const renderUserMenu = () => (isAuthenticated ? <DropdownMenu onUserSettingsClick={handleUserSettingsClick}/> : <Login />);


  // TODO: Get rid of this eventually. Just a bandaid since auth status not updating fast enough for Navbar.
  const fadeIn = 'transform transition-all duration-700 ease-out opacity-100 translate-y-0';
  const fadeOut = 'transform transition-all duration-700 ease-in opacity-0 translate-y-(-100%)';
  const hidden = 'opacity-0';
  const isAuthInitialized = isAuthenticated !== null;

  return (
    <header
      className={`bg --system-text-color absolute inset-x-0 top-0 z-50 transform ${
        isAuthInitialized ? fadeIn : hidden
      } ${!isAuthInitialized ? fadeOut : ''}`}
    >
      <nav className='flex items-center justify-between p-6 lg:px-8' aria-label='Global'>
        <div className='flex lg:flex-1'>
          <a href='.' className='-m-1.5 p-1.5'>
            <span className='sr-only'>Compass</span>
            <Image src='/logo.png' height={45} width={45} alt='Compass Logo' />
          </a>
        </div>
        <div className='flex lg:hidden'>
          <button
            type='button'
            className='-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-400'
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className='sr-only'>Open main menu</span>
            <Bars3Icon className='h-6 w-6' aria-hidden='true' />
          </button>
        </div>
        <div className='hidden lg:flex lg:gap-x-12 '>
          {navigation.map((item) =>
            item.name === 'Dashboard' ? (
              <a
                key={item.name}
                href={item.href}
                className='text-sm font-semibold leading-6 text-[var(--system-text-color)]'
                onClick={handleDashboardClick}
              >
                {item.name}
              </a>
            ) : (
              <a
                key={item.name}
                href={item.href}
                className='text-sm font-semibold leading-6 text-[var(--system-text-color)]'
              >
                {item.name}
              </a>
            )
          )}
        </div>
        <div className='hidden lg:flex lg:flex-1 lg:justify-end'>{renderUserMenu()}</div>
      </nav>
      <Dialog as='div' className='lg:hidden' open={mobileMenuOpen} onClose={setMobileMenuOpen}>
        <div className='fixed inset-0 z-50' />
        <Dialog.Panel className='fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-gray-900 px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-white/10'>
          <div className='flex items-center justify-between'>
            <a href='/' className='-m-1.5 p-1.5'>
              <span className='sr-only'>Compass</span>
              <Image src='/logo.png' height={45} width={45} alt='Compass Logo' />
            </a>
            <button
              type='button'
              className='-m-2.5 rounded-md p-2.5 text-gray-400'
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className='sr-only'>Close menu</span>
              <XMarkIcon className='h-6 w-6' aria-hidden='true' />
            </button>
          </div>
          <div className='mt-6 flow-root'>
            <div className='-my-6 divide-y divide-gray-500/25'>
              <div className='space-y-2 py-6'>
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className='-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-white hover:bg-gray-800'
                  >
                    {item.name}
                  </a>
                ))}
                {isAuthenticated ? <DropdownMenu /> : <Login />}
                {/* TODO: Need to implement this for mobile port */}
                {/* <a
                  onClick={handleUserSettingsClick}
                  className='-mx-3 block cursor-pointer rounded-lg px-3 py-2 text-base font-semibold leading-7 text-white hover:bg-gray-800'
                >
                  User Settings
                </a> */}
              </div>
              <div className='hidden lg:flex lg:flex-1 lg:justify-end'>{renderUserMenu()}</div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  );
};

export default memo(Navbar);
