import useUserSlice from '@/store/userSlice';
import { MajorMinorType, ProfileProps } from '@/types';
import { useState } from 'react';

import {
  Autocomplete,
  AutocompleteOption,
  Button,
  ListItemContent,
  FormControl,
  Input,
  Typography,
  FormLabel,
  Switch,
} from '@mui/joy';

import SettingsToggleSwitch from './SettingsToggleSwitch';

function generateClassYears() {
  const currentYear = new Date().getFullYear() + 1;
  const classYears = [
    { code: currentYear.toString(), label: 'Senior' },
    { code: (currentYear + 1).toString(), label: 'Junior' },
    { code: (currentYear + 2).toString(), label: 'Sophomore' },
    { code: (currentYear + 3).toString(), label: 'Freshman' },
  ];
  return classYears;
}

// Should probably id these corresponding to the ids in the database
const majors = [
  { code: 'COS (A.B.)', label: 'Computer Science' },
  { code: 'COS (B.S.E.)', label: 'Computer Science' },
  { code: 'MAE', label: 'Mechanical and Aerospace Engineering' },
];

const minors = [
  { code: 'FIN (Certificate)', label: 'Finance' },
  { code: 'SML', label: 'Statistics and Machine Learning' },
  { code: 'OQDS', label: 'Optimization and Quantitative Decision Science' },
];

const undeclared = { code: null, label: 'Undeclared' };
const none = { code: null, label: 'None' };

const UserSettings: React.FC<ProfileProps> = ({ profile, onClose, onSave }) => {
  const { updateProfile } = useUserSlice();
  const [localFirstName, setLocalFirstName] = useState<string>(profile.firstName);
  const [localLastName, setLocalLastName] = useState<string>(profile.lastName);
  const [localClassYear, setLocalClassYear] = useState<{ code: string; label: string; } | null>(
    generateClassYears().find(year => year.code === profile.classYear) ?? null
  );
  const [localMajor, setLocalMajor] = useState<MajorMinorType | null>(profile.major ?? undeclared);
  const [localMinors, setLocalMinors] = useState<MajorMinorType[] | null>(
    profile.minors && profile.minors.length > 0 ? profile.minors : [none]
  );
  const [localTimeFormat24h, setLocalTimeFormat24h] = useState<boolean>(profile.timeFormat24h);
  const [localThemeDarkMode, setLocalThemeDarkMode] = useState<boolean>(profile.themeDarkMode);

  const handleFirstNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalFirstName(event.target.value);
  };

  const handleLastNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalLastName(event.target.value);
  };

  const handleClassYearChange = (newValue: { code: string; label: string; } | null) => {
    setLocalClassYear(newValue);
  };  

  const handleMajorChange = (newValue: MajorMinorType) => {
    setLocalMajor(newValue);
  };

  const handleMinorsChange = (newValue: MajorMinorType[] | undefined) => {
    if (newValue && newValue.length <= 2) setLocalMinors(newValue);
    else setLocalMinors(null);
  };

  const handleTimeFormatChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalTimeFormat24h(event.target.checked);
  };

  const handleThemeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalThemeDarkMode(event.target.checked);
  };

  const handleSave = async () => {
    const updatedSettings = {
      firstName: localFirstName,
      lastName: localLastName,
      major: localMajor,
      minors: localMinors,
      classYear: localClassYear, // Need an input validator
      timeFormat24h: localTimeFormat24h,
      themeDarkMode: localThemeDarkMode,
    };

    updateProfile(updatedSettings);
    onSave(updatedSettings);

    const response = await fetch(`${process.env.BACKEND}/update_settings/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedSettings),
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
      // TODO: Add a toast or pop-up to gracefully inform user of the error.
    } else {
      const data = await response.json();
      console.log('Update success', data);
      onClose();
    }
  };

  return (
    <div className='fixed top-0 left-0 w-screen h-screen flex justify-center items-center z-50'>
      <div className='bg-white p-5 rounded-lg max-w-md w-1/2 shadow-lg'>
        <div className='grid grid-cols-2 gap-4'>
          <Input
            placeholder='First name'
            variant='soft'
            value={localFirstName}
            onChange={(e) => setLocalFirstName(e.target.value)}
            fullWidth
          />
          <Input
            placeholder='Last name'
            variant='soft'
            value={localLastName}
            onChange={(e) => setLocalLastName(e.target.value)}
            fullWidth
          />
          <Autocomplete
            autoHighlight
            options={majors}
            placeholder='Select your major'
            variant='soft'
            value={localMajor}
            onChange={(_, newValue) => setLocalMajor(newValue)}
            getOptionLabel={(option) => option.label}
            renderOption={(props, option) => (
              <AutocompleteOption {...props}>
                <ListItemContent>
                  {option.label}
                  <Typography level='body-xs'>({option.code})</Typography>
                </ListItemContent>
              </AutocompleteOption>
            )}
          />
          <Autocomplete
            multiple
            autoHighlight
            options={minors}
            placeholder={'Select your minor(s)'}
            variant='soft'
            value={localMinors ?? undefined}
            onChange={(_, newValue) => setLocalMinors(newValue)}
            getOptionLabel={(option) => option.label}
            renderOption={(props, option) => (
              <AutocompleteOption {...props}>
                <ListItemContent>
                  {option.label}
                  <Typography level="body-xs">
                    ({option.code})
                  </Typography>
                </ListItemContent>
              </AutocompleteOption>
            )}
          />
          <Autocomplete
            autoHighlight
            options={generateClassYears()}
            placeholder='Class year'
            variant='soft'
            value={localClassYear}
            onChange={(_, newValue) => setLocalClassYear(newValue)}
            getOptionLabel={(option) => option.label}
            renderOption={(props, option) => (
              <AutocompleteOption {...props}>
                <ListItemContent>
                  {option.label}
                  <Typography level='body-xs'>({option.code})</Typography>
                </ListItemContent>
              </AutocompleteOption>
            )}
          />
          <FormControl
            orientation='horizontal'
            sx={{ width: '100%', justifyContent: 'space-between' }}
          >
            <div>
              <FormLabel>Dark Mode</FormLabel>
            </div>
            <Switch
              checked={localThemeDarkMode}
              onChange={(event) => setLocalThemeDarkMode(event.target.checked)}
              color={localThemeDarkMode ? 'success' : 'neutral'}
              variant={localThemeDarkMode ? 'solid' : 'outlined'}
            />
          </FormControl>
          <FormControl
            orientation='horizontal'
            sx={{ width: '100%', justifyContent: 'space-between' }}
          >
            <div>
              <FormLabel>24-Hour Time Format</FormLabel>
            </div>
            <Switch
              checked={localTimeFormat24h}
              onChange={(event) => setLocalTimeFormat24h(event.target.checked)}
              color={localTimeFormat24h ? 'success' : 'neutral'}
              variant={localTimeFormat24h ? 'solid' : 'outlined'}
            />
          </FormControl>
        </div>
        <div className='mt-5 text-right'>
          <Button
            variant='solid'
            color='primary'
            onClick={handleSave}
            size='md'>
            Save
          </Button>
          <Button
            variant='outlined'
            color='neutral'
            onClick={onClose}
            sx={{ ml: 2 }}
            size='sm'>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
