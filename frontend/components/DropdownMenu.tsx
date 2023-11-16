import React, { Fragment, useState, useEffect } from 'react';
import { Menu, Transition } from '@headlessui/react';
import clsx from 'clsx';
import UserSettings from './UserSettings';
import { Logout } from './Logout';
import { Settings, MenuItemProps } from '../types';
import SettingsModal from './Modal';

const MenuItem: React.FC<MenuItemProps> = ({ isActive, children, onClick }) => (
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
  const [userSettings, setUserSettings] = useState<Settings>({
    firstName: '',
    lastName: '',
    major: '',
    minors: [],
    timeFormat24h: false, // TODO: will do later, change CustomUser so they have this field
    themeDarkMode: false, // TODO: will do later, change CustomUser so they have this field
  });
  const closeMenu = () => setIsMenuOpen(false);
  const fetchProfile = async () => {
    try {
      const response = await fetch('http://localhost:8000/profile/', {
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
        data.first_name && data.last_name ? `${data.first_name} ${data.last_name}` : 'Profile';
      localStorage.setItem('username', fullName);
      setUsername(fullName);
      setUserSettings({
        firstName: data.first_name,
        lastName: data.last_name,
        major: data.major,
        minors: data.minors,
        timeFormat24h: data.timeFormat24h,
        themeDarkMode: data.themeDarkMode,
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSaveUserSettings = async (updatedUser: Settings) => {
    try {
      const response = await fetch('http://localhost:8000/update_profile/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser),
      });

      if (!response.ok) {
        // Have a little alert component popup to tell them the error
      }

      const updatedData = await response.json();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  useEffect(() => {
    const cachedUsername = localStorage.getItem('username');
    if (cachedUsername) {
      setUsername(cachedUsername);
    } else {
      fetchProfile();
    }
  }, []);

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
            settings={userSettings}
            onClose={() => setBlur(false)}
            onSave={handleSaveUserSettings}
          />
        </SettingsModal>
      )}
    </div>
  );
};

export default DropdownMenu;
