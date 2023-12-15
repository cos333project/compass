import { useState } from 'react';

import {
  Autocomplete,
  AutocompleteOption,
  Button,
  ListItemContent,
  Input,
  Typography,
  FormLabel,
  Snackbar,
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
    return data.csrfToken ? String(data.csrfToken) : '';
  } catch (error) {
    return 'Error fetching CSRF token!';
  }
}

function generateClassYears() {
  const currentYear = new Date().getFullYear() + 1;
  const classYears = [currentYear, currentYear + 1, currentYear + 2, currentYear + 3];
  return classYears;
}

// Should probably id these corresponding to the ids in the database
const undeclared = { code: 'Undeclared', name: 'Undeclared' };

// Should probably id these corresponding to the ids in the database
const majorOptions = [
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
  { code: 'Independent', name: 'Independent' },
  { code: 'Undeclared', name: 'Undeclared' },
];

const minorOptions = [
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
  const [classYear, setClassYear] = useState(profile.classYear || undefined);
  const [major, setMajor] = useState<MajorMinorType>(profile.major ?? undeclared);
  const [minors, setMinors] = useState<MajorMinorType[]>(profile.minors || []);
  // const [timeFormat24h, setTimeFormat24h] = useState<boolean>(profile.timeFormat24h);
  // const [themeDarkMode, setThemeDarkMode] = useState<boolean>(profile.themeDarkMode);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleMinorsChange = (_, newMinors: MajorMinorType[]) => {
    const uniqueMinors = Array.from(new Set(newMinors.map((minor) => minor.code))).map((code) =>
      newMinors.find((minor) => minor.code === code)
    );
    if (uniqueMinors.length > 3) {
      setOpenSnackbar(true);
    } else {
      setMinors(uniqueMinors);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleSave = async () => {
    console.log('UserSettings handleSave called');
    updateProfile({
      firstName: firstName,
      lastName: lastName,
      major: major ?? undeclared,
      minors: minors,
      classYear: classYear,
      // timeFormat24h: timeFormat24h,
      // themeDarkMode: themeDarkMode, // TODO: This isn't stateful yet --Windsor (people use light mode, trussss... :p)
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
      .then((data) => {
        console.log('Update success', data);
        onSave(profile);
        onClose();
      })
      .catch((error) => console.error('Update Error:', error));
  };

  document.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSave();
    } else if (event.key === 'Escape') {
      onClose();
    }
  });

  return (
    <div className='fixed inset-0 flex justify-center items-center z-50'>
      <div className='bg-white p-8 rounded-xl max-w-2xl w-2/3 shadow-2xl border border-gray-400'>
        <div className='grid grid-cols-2 gap-6'>
          <div>
            <FormLabel>First name</FormLabel>
            <Input
              placeholder='First name'
              variant='soft'
              autoComplete='off'
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div>
            <FormLabel>Last name</FormLabel>
            <Input
              placeholder='Last name'
              variant='soft'
              autoComplete='off'
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div>
            <FormLabel>Major</FormLabel>
            <Autocomplete
              multiple={false}
              autoComplete={true}
              options={majorOptions}
              placeholder='Select your major'
              variant='soft'
              value={major}
              inputValue={major.code === undeclared.code ? '' : major.code}
              isOptionEqualToValue={(option, value) => option.code === value.code}
              onChange={(_, newMajor: MajorMinorType) => setMajor(newMajor ?? undeclared)}
              getOptionLabel={(option: MajorMinorType) => option.code}
              renderOption={(props, option) => (
                <AutocompleteOption {...props} key={option.name}>
                  <ListItemContent>
                    {option.code}
                    <Typography level='body-sm'>{option.name}</Typography>
                  </ListItemContent>
                </AutocompleteOption>
              )}
            />
          </div>
          <div>
            <FormLabel>Minor(s)</FormLabel>
            <Autocomplete
              multiple={true}
              autoComplete={true}
              options={minorOptions}
              placeholder={'Select your minor(s)'}
              variant='soft'
              value={minors}
              isOptionEqualToValue={(option, value) =>
                value === undefined || option.code === value.code
              }
              onChange={handleMinorsChange}
              getOptionLabel={(option: MajorMinorType) => option.code}
              renderOption={(props, option) => (
                <AutocompleteOption {...props} key={option.name}>
                  <ListItemContent>
                    {option.code}
                    <Typography level='body-sm'>{option.name}</Typography>
                  </ListItemContent>
                </AutocompleteOption>
              )}
            />
          </div>
          <Snackbar
            open={openSnackbar}
            color={'primary'}
            variant={'soft'}
            onClose={handleCloseSnackbar}
            autoHideDuration={6000}
            sx={{
              '.MuiSnackbar-root': {
                borderRadius: '16px', // Roundedness
              },
              backgroundColor: '#0F1E2F', // Compass Blue
              color: '#f6f6f6', // Compass Gray
            }}
          >
            <div className='text-center'>
              You can only minor in two programs and plan up to three.
            </div>
          </Snackbar>
          {/* <div>
            <FormLabel>Certificate(s)</FormLabel>
            <Autocomplete
              multiple={true}
              options={minorOptions}
              placeholder={'Select your certificate(s)'}
              variant='soft'
              value={minors}
              isOptionEqualToValue={(option, value) => value === undefined || option === value}
              onChange={handleMinorsChange}
              getOptionLabel={(option: MajorMinorType) => option.code}
              renderOption={(props, option) => (
                <AutocompleteOption {...props} key={option.name}>
                  <ListItemContent>
                    {option.code}
                    <Typography level='body-sm'>{option.name}</Typography>
                  </ListItemContent>
                </AutocompleteOption>
              )}
            />
          </div> */}
          <div>
            <FormLabel>Class year</FormLabel>
            <Autocomplete
              multiple={false}
              autoComplete={true}
              options={generateClassYears()}
              placeholder='Class year'
              variant='soft'
              value={classYear} // TODO: Does '' work here or is it redundant? --Windsor
              isOptionEqualToValue={(option, value) => value === undefined || option === value}
              onChange={(_, newClassYear: number | undefined) => {
                setClassYear(newClassYear ?? undefined);
              }}
              getOptionLabel={(option) => option.toString()}
              renderOption={(props, option) => (
                <AutocompleteOption {...props} key={option}>
                  <ListItemContent>{option}</ListItemContent>
                </AutocompleteOption>
              )}
            />
          </div>
          {/* <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <FormLabel>Dark Mode</FormLabel>
            <Switch
              checked={themeDarkMode}
              onChange={(e) => setThemeDarkMode(e.target.checked)}
              color={themeDarkMode ? 'success' : 'neutral'}
              variant={themeDarkMode ? 'solid' : 'outlined'}
            />
          </Box> */}

          {/* Implement this once we have ReCal functionality, perhaps in IW work */}
          {/* <FormControl
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
          </FormControl> */}
        </div>
        <div className='mt-5 text-right'>
          <Button variant='soft' color='primary' onClick={handleSave} size='md'>
            Save
          </Button>
          <Button variant='soft' color='neutral' onClick={onClose} sx={{ ml: 2 }} size='md'>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};
export default UserSettings;
