import * as React from 'react';
import Box from '@mui/material/Box';
import Input from '@mui/material/Input';

const ariaLabel = { 'aria-label': 'description' };

export default function Inputs() {
  return (
    <Box
      component="form"
      sx={{
        '& > :not(style)': { m: 1 },
        '& .MuiInputBase-root': {
          '&:focus-within': {
            outline: 'none',
          },
        },
      }}
      noValidate
      autoComplete="off"
    >
      <Input defaultValue="" inputProps={ariaLabel} />
      <Input placeholder="" inputProps={ariaLabel} />
      <Input disabled defaultValue="Disabled" inputProps={ariaLabel} />
      <Input defaultValue="Error" error inputProps={ariaLabel} />
    </Box>
  );
}
