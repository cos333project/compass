import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import SelectField from './SettingsSelectField';
import { SettingsProps } from '../types';
import SettingsToggleSwitch from './SettingsToggleSwitch';

const majorsList = [
  'Computer Science', 
  'Biology', 
  'Economics'
];

const minorsList = [
  'Mathematics', 
  'History', 
  'Art'
];

const UserSettings: React.FC<SettingsProps> = ({ settings, onClose, onSave }) => {
  const { firstName, lastName, major, minors, timeFormat24h, themeDarkMode } = settings;
  const [firstNameState, setFirstName] = useState(firstName);
  const [lastNameState, setLastName] = useState(lastName);
  const [majorState, setMajor] = useState(major);
  const [minorsState, setMinors] = useState(minors);
  const [timeFormat24hState, setTimeFormat] = useState(timeFormat24h);
  const [themeDarkModeState, setThemeDarkMode] = useState(themeDarkMode);

  const handleMinorsChange = (selectedMinors: string | string[] | undefined) => {
    if (Array.isArray(selectedMinors)) {
      setMinors(selectedMinors);
    }
  };

  const handleMajorChange = (value: string | string[] | undefined) => {
    if (typeof value === 'string') {
      setMajor(value);
    }
  };

  const handleSave = () => {
    onSave({ firstName: firstNameState, lastName: lastNameState, major: majorState, minors: minorsState, timeFormat24h: timeFormat24hState, themeDarkMode: themeDarkModeState });
    onClose();
  };

  return (
    <div className="fixed top-0 left-0 w-screen h-screen flex justify-center items-center z-50">
      <div className="bg-white p-5 rounded-lg max-w-md w-1/2 shadow-lg">
        <div className="grid grid-cols-2 gap-4">
          <input type="text" value={firstNameState} onChange={(e) => setFirstName(e.target.value)} placeholder="First Name" className="input-field-class"/>
          <input type="text" value={lastNameState} onChange={(e) => setLastName(e.target.value)} placeholder="Last Name" className="input-field-class"/>
          <SelectField label="Major" options={majorsList} value={majorState} onChange={handleMajorChange} />
          <SelectField label="Minors" options={minorsList} value={minorsState} onChange={handleMinorsChange} multiple />
          <SettingsToggleSwitch label="Dark Mode" checked={themeDarkModeState} onChange={setThemeDarkMode} />
          <SettingsToggleSwitch label="24-Hour Time Format" checked={timeFormat24hState} onChange={setTimeFormat} />
        </div>
        <div className="mt-5 text-right">
          <button className="bg-blue-500 text-white rounded px-4 py-2" onClick={handleSave}>Save</button>
          <button className="ml-2 bg-gray-200 rounded px-4 py-2" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
