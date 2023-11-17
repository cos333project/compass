import React, { useEffect, useState } from 'react';
import SelectField from './SettingsSelectField';
import SettingsToggleSwitch from './SettingsToggleSwitch';
import useUserSlice from '@/store/userSlice';
import { SettingsProps } from '@/store/userSlice';

const majorsList = ['Computer Science', 'Biology', 'Economics'];
const minorsList = ['Mathematics', 'History', 'Art', 'English', 'ballz'];
const yearList = ['2024', '2025', '2026', '2027'];

const UserSettings: React.FC<SettingsProps> = ({ settings, onClose, onSave }) => {
  const { update } = useUserSlice();
  const [localFirstName, setLocalFirstName] = useState(settings.firstName || '');
  const [localLastName, setLocalLastName] = useState(settings.lastName || '');
  const [localMajor, setLocalMajor] = useState(settings.major || '');
  const [localMinors, setLocalMinors] = useState(settings.minors || '');
  const [localClassYear, setLocalClassYear] = useState(settings.classYear || '');
  const [localTimeFormat24h, setLocalTimeFormat24h] = useState(settings.timeFormat24h || false);
  const [localThemeDarkMode, setLocalThemeDarkMode] = useState(settings.themeDarkMode || false);

  useEffect(() => {
    setLocalFirstName(settings.firstName || '');
    setLocalLastName(settings.lastName || '');
    setLocalMajor(useUserSlice.getState().major);
    setLocalMinors(useUserSlice.getState().minors);
    setLocalClassYear(useUserSlice.getState().classYear || '');
    setLocalTimeFormat24h(settings.timeFormat24h || false);
    setLocalThemeDarkMode(settings.themeDarkMode || false);
  }, [settings]);

  const handleSave = () => {
    update({
      firstName: localFirstName,
      lastName: localLastName,
      major: localMajor,
      minors: localMinors,
      classYear: localClassYear,
      timeFormat24h: localTimeFormat24h,
      themeDarkMode: localThemeDarkMode,
    });

    onSave(useUserSlice.getState());

    fetch(process.env.BACKEND + '/update_user_class_year', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Need CSRF token here from Next.js
      body: useUserSlice.getState().classYear,
    })
      .then((response) => response.json())
      .then((data) => console.log('Update success', data))
      .catch((error) => console.error('Update Error:', error));

    console.log(localMajor);
    console.log(useUserSlice.getState().major);
    onClose();
  };

  return (
    <div className='fixed top-0 left-0 w-screen h-screen flex justify-center items-center z-50'>
      <div className='bg-white p-5 rounded-lg max-w-md w-1/2 shadow-lg'>
        <div className='grid grid-cols-2 gap-4'>
          <input
            type='text'
            value={localFirstName}
            onChange={(e) => setLocalFirstName(e.target.value)}
            placeholder='First Name'
            className='input-field-class'
          />
          <input
            type='text'
            value={localLastName}
            onChange={(e) => setLocalLastName(e.target.value)}
            placeholder='Last Name'
            className='input-field-class'
          />
          <input
            type='text'
            value={localMajor}
            onChange={(e) => setLocalMajor(e.target.value)}
            placeholder='Major'
            className='input-field-class'
          />
          <input
            type='text'
            value={localMinors}
            onChange={(e) => setLocalMinors(e.target.value)}
            placeholder='Minors'
            className='input-field-class'
          />
          <input
            type='text'
            value={localClassYear}
            onChange={(e) => setLocalClassYear(e.target.value)}
            placeholder='Class Year'
            className='input-field-class'
          />
          <SettingsToggleSwitch
            label='Dark Mode'
            checked={localThemeDarkMode}
            onChange={() => setLocalThemeDarkMode(!localThemeDarkMode)}
          />
          {/*<SettingsToggleSwitch*/}
          {/*  label='24-Hour Time Format'*/}
          {/*  checked={localTimeFormat24h}*/}
          {/*  onChange={() => setLocalTimeFormat24h(!localTimeFormat24h)}*/}
          {/*/>*/}
        </div>
        <div className='mt-5 text-right'>
          <button className='bg-blue-500 text-white rounded px-4 py-2' onClick={handleSave}>
            Save
          </button>
          <button className='ml-2 bg-gray-200 rounded px-4 py-2' onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
