import React, { Fragment, useState, useEffect } from 'react';
import { Menu, Transition } from '@headlessui/react';
import clsx from 'clsx';
import UserSettings, { IUser } from './UserSettings'; // Ensure this import path is correct
import { Logout } from './Logout';

interface MenuItemProps {
  isActive: boolean;
  children: React.ReactNode;
  onClick: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ isActive, children, onClick }) => {
  return (
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
};

const DropdownMenu: React.FC = () => {
  const [username, setUsername] = useState('Profile');
  const [showUserSettings, setShowUserSettings] = useState(false);
  const [userData, setUserData] = useState<IUser>({
    major: 'Computer Science',
    minors: ['Finance', 'Journalism'],
    firstName: 'John',
    lastName: 'Doe',
    email: 'johhdoe@gmail.com',
  });
  

  const handleSaveUserSettings = (updatedUser: IUser) => {
    setUserData(updatedUser);
  };

  useEffect(() => {
    const cachedUsername = localStorage.getItem('username');
    const Name = localStorage.getItem('fullName')
    if (cachedUsername) {
      setUsername(cachedUsername);
    } else {
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
          console.log('data:', data)
          const fullName = data.first_name && data.last_name 
                            ? `${data.first_name} ${data.last_name}`
                            : 'Profile';
          
          localStorage.setItem('username', fullName);
          setUsername(fullName);
          setUserData({
              major: data.major, 
              minors: data.minors,
              firstName: data.first_name,
              lastName: data.last_name,
              email: data.email,
            });
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      };
      fetchProfile();
    }
  }, []);
  
  useEffect(() => {
    const appContent = document.querySelector('.app-content');
    if (appContent) {
      showUserSettings ? appContent.classList.add('blurred') : appContent.classList.remove('blurred');
    }
  }, [showUserSettings]);

  return (
    <div>
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button className="inline-flex w-full justify-center items-center rounded-md px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
            {username}
          </Menu.Button>
        </div>
        <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
          <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <MenuItem isActive={active} onClick={() => setShowUserSettings(true)}>Account settings</MenuItem>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <MenuItem isActive={active} onClick={() => console.log('Logout clicked')}>
                    <Logout />
                  </MenuItem>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>

      {showUserSettings && (
        <UserSettings
          user={userData}
          onClose={() => setShowUserSettings(false)}
          onSave={handleSaveUserSettings}
        />
      )}
    </div>
  );
};

export default DropdownMenu;
