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
  Snackbar,
  Switch,
} from '@mui/joy';

import { MajorMinorType, ProfileProps } from '@/types';

import useUserSlice from '@/store/userSlice';

async function fetchCsrfToken() {
  try {
    const response = await fetch(`${process.env.BACKEND}/csrf`, {
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data.csrfToken;
  } catch (error) {
    console.log(error);
    return 'Error fetching CSRF token!';
  }
}

function generateClassYears() {
  const currentYear = new Date().getFullYear() + 1;
  const classYears = [currentYear, currentYear + 1, currentYear + 2, currentYear + 3];
  return classYears;
}

// Should probably id these corresponding to the ids in the database
const undeclared = { code: 'UND', name: 'Undeclared' };

// Should probably id these corresponding to the ids in the database
const majorsOptions = [
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
  { code: 'COS-AB', name: 'Computer Science - A.B.' },
  { code: 'COS-BSE', name: 'Computer Science - B.S.E.' },
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

const minorsOptions = [
  { code: 'FIN', name: 'Finance' },
  { code: 'DAN', name: 'Dance' },
  { code: 'CLA', name: 'Classics' },
  { code: 'CHI', name: 'Chinese Language' },
  { code: 'CS', name: 'Climate Science' },
  { code: 'MQE', name: 'Quantitative Economics' },
];

const UserSettings: React.FC<ProfileProps> = ({ profile, onClose, onSave }) => {
  const { updateProfile } = useUserSlice((state) => state);
  const [firstName, setFirstName] = useState<string>(profile.firstName);
  const [lastName, setLastName] = useState<string>(profile.lastName);
  const [classYear, setClassYear] = useState<number | undefined>(profile.classYear);
  // const [major, setMajor] = useState<MajorMinorType | undefined>(profile.major ?? undeclared);
  const [major, setMajor] = useState<MajorMinorType>(profile.major ?? undeclared);
  // const [minors, setMinors] = useState<MajorMinorType[] | undefined>(
  //   profile.minors && profile.minors.length > 0 ? profile.minors : undefined
  // );
  const [minors, setMinors] = useState<MajorMinorType[]>(
    profile.minors.length > 0 ? profile.minors : undefined
  );
  const [timeFormat24h, setTimeFormat24h] = useState<boolean>(profile.timeFormat24h);
  const [themeDarkMode, setThemeDarkMode] = useState<boolean>(profile.themeDarkMode);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleMinorsChange = (_, newMinors: MajorMinorType[]) => {
    if (newMinors.length <= 2) {
      setMinors(newMinors);
    } else {
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleSave = async () => {
    // Updates useUserSlice.getState().profile
    updateProfile({
      firstName: firstName,
      lastName: lastName,
      major: major,
      minors: minors,
      classYear: classYear,
      timeFormat24h: timeFormat24h,
      themeDarkMode: themeDarkMode,
    });

    profile = useUserSlice.getState().profile;
    const csrfToken = await fetchCsrfToken();
    fetch(`${process.env.BACKEND}/update_profile/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      body: JSON.stringify(profile),
    })
      // TODO: Delete the logs eventually
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
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <Input
            placeholder='Last name'
            variant='soft'
            autoComplete='off'
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <Autocomplete
            multiple={false}
            autoHighlight
            options={majorsOptions}
            placeholder='Select your major'
            variant='soft'
            value={major}
            isOptionEqualToValue={(option, value) => value === undefined || option === value}
            onChange={(_, newMajor: MajorMinorType) => setMajor(newMajor)}
            getOptionLabel={(option: MajorMinorType) => option.code}
            renderOption={(props, option) => (
              <AutocompleteOption {...props} key={option.name}>
                <ListItemContent>
                  {option.code}
                  <Typography level='body-xs'>{option.name}</Typography>
                </ListItemContent>
              </AutocompleteOption>
            )}
            disabled={minors.length >= 2}
          />
          <Autocomplete
            multiple={true}
            autoHighlight
            options={minorsOptions}
            placeholder={'Select your minor(s)'}
            variant='soft'
            value={minors}
            isOptionEqualToValue={(option, value) => value === undefined || option === value}
            onChange={handleMinorsChange}
            getOptionLabel={(option: MajorMinorType) => option.code}
            renderOption={(props, option) => (
              <AutocompleteOption {...props} key={option.name}>
                <ListItemContent>
                  {option.code}
                  <Typography level='body-xs'>{option.name}</Typography>
                </ListItemContent>
              </AutocompleteOption>
            )}
          />
          <Snackbar open={openSnackbar} onClose={handleCloseSnackbar} autoHideDuration={6000}>
            <div>You can&apos;t choose more than two minors.</div>
          </Snackbar>
          <Autocomplete
            multiple={false}
            autoHighlight
            options={generateClassYears()}
            placeholder='Class year'
            variant='soft'
            value={classYear}
            isOptionEqualToValue={(option, value) => option === value}
            onChange={(_, newClassYear: number) => setClassYear(newClassYear)}
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
              checked={themeDarkMode}
              onChange={(e) => setThemeDarkMode(e.target.checked)}
              color={themeDarkMode ? 'success' : 'neutral'}
              variant={themeDarkMode ? 'solid' : 'outlined'}
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
              checked={timeFormat24h}
              onChange={(e) => setTimeFormat24h(e.target.checked)}
              // TODO: Consider changing color to match our color palette
              color={timeFormat24h ? 'success' : 'neutral'}
              variant={timeFormat24h ? 'solid' : 'outlined'}
            />
          </FormControl>
        </div>
        <div className='mt-5 text-right'>
          <Button variant='soft' color='primary' onClick={handleSave} size='md'>
            Save
          </Button>
          <Button variant='soft' color='neutral' onClick={onClose} sx={{ ml: 2 }} size='md'>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
export default UserSettings;
