import { useState, useEffect } from 'react';

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

import { MajorMinorType, ProfileProps } from '@/types';

import useUserSlice from '@/store/userSlice';

function generateClassYears() {
  const currentYear = new Date().getFullYear() + 1;
  const classYears = [currentYear, currentYear + 1, currentYear + 2, currentYear + 3];
  return classYears;
}

// Should probably id these corresponding to the ids in the database
const undeclared = { code: 'UND', name: 'Undeclared' };
// const none: MajorMinorType = { code: 'None', name: 'No minors selected' };

// Should probably id these corresponding to the ids in the database
const majors = [
  { code: 'AAS', name: 'African American Studies' },
  { code: 'ANT', name: 'Anthropology' },
  { code: 'ARC', name: 'Architecture' },
  { code: 'ART', name: 'Art and Archaeology' },
  { code: 'AST', name: 'Astrophysical Sciences' },
  { code: 'CBE', name: 'Chemical and Biological Engineering' },
  { code: 'CEE', name: 'Civil and Environmental Engineering' },
  { code: 'CHM', name: 'Chemistry' },
  { code: 'CLA', name: 'Classics' },
  { code: 'COM', name: 'Comparative Literature' },
  { code: 'COS (A.B.)', name: 'Computer Science' },
  { code: 'COS (B.S.E.)', name: 'Computer Science' },
  { code: 'EAS', name: 'East Asian Studies' },
  { code: 'ECE', name: 'Electrical and Computer Engineering' },
  { code: 'ECO', name: 'Economics' },
  { code: 'EEB', name: 'Ecology and Evolutionary Biology' },
  { code: 'ENG', name: 'English' },
  { code: 'FIT', name: 'French and Italian' },
  { code: 'GEO', name: 'Geosciences' },
  { code: 'GER', name: 'German' },
  { code: 'HIS', name: 'History' },
  { code: 'MAE', name: 'Mechanical and Aerospace Engineering' },
  { code: 'MAT', name: 'Mathematics' },
  { code: 'MOL', name: 'Molecular Biology' },
  { code: 'MUS', name: 'Music' },
  { code: 'NES', name: 'Near Eastern Studies' },
  { code: 'NEU', name: 'Neuroscience' },
  { code: 'ORF', name: 'Operations Research and Financial Engineering' },
  { code: 'PHI', name: 'Philosophy' },
  { code: 'PHY', name: 'Physics' },
  { code: 'POL', name: 'Politics' },
  { code: 'PSY', name: 'Psychology' },
  { code: 'REL', name: 'Religion' },
  { code: 'SLA', name: 'Slavic Languages and Literatures' },
  { code: 'SOC', name: 'Sociology' },
  { code: 'SPO', name: 'Spanish and Portuguese' },
  { code: 'SPI', name: 'Princeton School of Public and International Affairs' },
  { code: 'IND', name: 'Independent' },
];

const minors = [
  { code: 'FIN', name: 'Finance' },
  { code: 'SML', name: 'Statistics and Machine Learning' },
  { code: 'CLA', name: 'Classics' },
];

const UserSettings: React.FC<ProfileProps> = ({ profile, onClose, onSave }) => {
  const { updateProfile } = useUserSlice((state) => state);
  const [localFirstName, setLocalFirstName] = useState<string>(profile.firstName);
  const [localLastName, setLocalLastName] = useState<string>(profile.lastName);
  const [localClassYear, setLocalClassYear] =
    useState<number | undefined>(profile.classYear) ?? undefined;
  const [localMajor, setLocalMajor] = useState<MajorMinorType | undefined>(
    profile.major ?? undeclared
  );
  const [localMinors, setLocalMinors] = useState<MajorMinorType[] | undefined>(
    profile.minors && profile.minors.length > 0 ? profile.minors : undefined // Change to none type eventually
  );
  const [localTimeFormat24h, setLocalTimeFormat24h] = useState<boolean>(profile.timeFormat24h);
  const [localThemeDarkMode, setLocalThemeDarkMode] = useState<boolean>(profile.themeDarkMode);

  useEffect(() => {
    setLocalFirstName(profile.firstName);
    setLocalLastName(profile.lastName);
    setLocalClassYear(profile.classYear);
    setLocalMajor(profile.major);
    setLocalMinors(profile.minors);
    setLocalTimeFormat24h(profile.timeFormat24h);
    setLocalThemeDarkMode(profile.themeDarkMode);
  }, [profile]);

  const handleSave = async () => {
    // Updates useUserSlice.getState().profile
    updateProfile({
      firstName: localFirstName,
      lastName: localLastName,
      major: localMajor,
      minors: localMinors,
      classYear: localClassYear,
      timeFormat24h: localTimeFormat24h,
      themeDarkMode: localThemeDarkMode,
    });

    // Updates local profile. Do we even need a local profile?
    profile = useUserSlice.getState().profile;

    const csrfToken = document.cookie
      .split('; ')
      .find((row) => row.startsWith('csrftoken='))!
      .split('=')[1]; // CSRF token always exists with our Django backend
    fetch(`${process.env.BACKEND}/update_profile/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      // Need CSRF token here from Next.js
      body: JSON.stringify(profile),
    })
      .then((response) => response.json())
      .then((data) => console.log('Update success', data))
      .catch((error) => console.error('Update Error:', error));

    onSave(profile);
    onClose();
  };
  return (
    <div className='fixed top-0 left-0 w-screen h-screen flex justify-center items-center z-50'>
      <div className='bg-white p-5 rounded-lg max-w-md w-1/2 shadow-lg'>
        <div className='grid grid-cols-2 gap-4'>
          <Input
            placeholder='First name'
            variant='soft'
            autoComplete='off'
            value={localFirstName}
            onChange={(e) => setLocalFirstName(e.target.value)}
          />
          <Input
            placeholder='Last name'
            variant='soft'
            autoComplete='off'
            value={localLastName}
            onChange={(e) => setLocalLastName(e.target.value)}
          />
          <Autocomplete
            autoHighlight
            options={majors}
            placeholder='Select your major'
            variant='soft'
            value={localMajor}
            isOptionEqualToValue={(option, value) => value === undefined || option === value}
            onChange={(_, e) => setLocalMajor(e ?? undefined)}
            getOptionLabel={(option) => option.name}
            renderOption={(props, option) => (
              <AutocompleteOption {...props} key={option.code}>
                <ListItemContent>
                  {option.code}
                  <Typography level='body-xs'>{option.name}</Typography>
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
            value={localMinors}
            isOptionEqualToValue={(option, value) => value === undefined || option === value}
            onChange={(_, e) => setLocalMinors(e)}
            getOptionLabel={(option) => option.name}
            renderOption={(props, option) => (
              <AutocompleteOption {...props} key={option.code}>
                <ListItemContent>
                  {option.code}
                  <Typography level='body-xs'>{option.name}</Typography>
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
            isOptionEqualToValue={(option, value) => value === undefined || option === value}
            onChange={(_, e) => setLocalClassYear(e ?? undefined)}
            getOptionLabel={(option) => option.toString()}
            renderOption={(props, option) => (
              <AutocompleteOption {...props} key={option}>
                <ListItemContent>{option}</ListItemContent>
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
              onChange={(e) => setLocalThemeDarkMode(e.target.checked)}
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
              onChange={(e) => setLocalTimeFormat24h(e.target.checked)}
              // TODO: Consider changing color to match our color palette
              color={localTimeFormat24h ? 'success' : 'neutral'}
              variant={localTimeFormat24h ? 'solid' : 'outlined'}
            />
          </FormControl>
        </div>
        <div className='mt-5 text-right'>
          <Button variant='solid' color='primary' onClick={handleSave} size='md'>
            Save
          </Button>
          <Button variant='outlined' color='neutral' onClick={onClose} sx={{ ml: 2 }} size='sm'>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
export default UserSettings;
