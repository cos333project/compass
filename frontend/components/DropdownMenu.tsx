import { Fragment, useState, useEffect } from 'react';

import { Menu, Transition } from '@headlessui/react';
import clsx from 'clsx';

import { MenuItemProps } from '../types';

import useUserSlice from '../store/userSlice';

import { Logout } from './Logout';
import SettingsModal from './Modal';
import UserSettings from './UserSettings';

const MenuItem: React.FC<MenuItemProps> = ({
                                             isActive,
                                             children,
                                             onClick
                                           }) => (
  <div
    className={clsx(
      isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
      'block px-4 py-2 text-sm'
    )}
    onClick={onClick}
  >
    {children}
  </div>
);

const DropdownMenu: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [blur, setBlur] = useState(false);
  const [username, setUsername] = useState('Profile');
  const [userProfile, updateProfile] = useUserSlice((state) => [
    state.profile,
    state.updateProfile,
  ]);
  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${process.env.BACKEND}/profile/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        if (!response.ok) {
          console.error('Server response:', response.status, response.statusText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const fullName =
          data.firstName && data.lastName ? `${data.firstName} ${data.lastName}` : 'Profile';
        // localStorage.setItem('username', fullName);
        setUsername(fullName);
        updateProfile({
          firstName: data.firstName,
          lastName: data.lastName,
          major: data?.major,
          minors: data?.minors,
          classYear: data.classYear,
          netId: data.netId,
          universityId: '',
          email: '',
          department: '',
          timeFormat24h: data.timeFormat24h,
          themeDarkMode: data.themeDarkMode,
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchProfile();
  }, [updateProfile]);

  return (
    <div>
      <Menu as='div' className='relative inline-block text-left'>
        <Menu.Button
          className='inline-flex w-full justify-center items-center rounded-md px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50'
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {username}
        </Menu.Button>
        {isMenuOpen && (
          <Transition
            as={Fragment}
            show={isMenuOpen}
            enter='transition ease-out duration-100'
            enterFrom='transform opacity-0 scale-95'
            enterTo='transform opacity-100 scale-100 bg-gray-700 bg-opacity-30'
            leave='transition ease-in duration-75'
            leaveFrom='transform opacity-100 scale-100'
            leaveTo='transform opacity-0 scale-95'
          >
            <Menu.Items className='absolute right-0 mt-2 w-48 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5'>
              <div className='py-1'>
                <MenuItem
                  isActive={false}
                  onClick={() => {
                    setBlur(true);
                    closeMenu();
                  }}
                >
                  Account settings
                </MenuItem>
                <MenuItem
                  isActive={false}
                  onClick={() => {
                    console.log('Logout clicked');
                    closeMenu();
                  }}
                >
                  <Logout />
                </MenuItem>
              </div>
            </Menu.Items>
          </Transition>
        )}
      </Menu>

      {blur && (
        <SettingsModal onClose={() => setBlur(false)}>
          <UserSettings
            profile={userProfile}
            onClose={() => setBlur(false)}
            onSave={() => {
              setBlur(false);
              window.location.reload();
            }}
          />
        </SettingsModal>
      )}
    </div>
  );
};

export default DropdownMenu;
