import * as React from 'react';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

export default function Variants() {
  return (
    <Box sx={{ width: '100%' }}>
      {/* Simulating Navbar */}
      <Skeleton variant='rectangular' width='100%' height={50} />

      {/* Main Content Area */}
      <Stack direction='row' spacing={2} sx={{ mt: 2 }}>
        {/* Simulating Sidebar for Search */}
        <Stack spacing={1} sx={{ width: '20%' }}>
          <Skeleton variant='text' width='80%' />
          <Skeleton variant='rectangular' height={40} />
          <Skeleton variant='rectangular' height={400} />
        </Stack>

        {/* Simulating Carousel for Courses */}
        <Stack spacing={1} sx={{ flexGrow: 1 }}>
          <Stack direction='row' spacing={1}>
            <Skeleton variant='rectangular' width={100} height={40} />
            <Skeleton variant='rectangular' width={100} height={40} />
          </Stack>
          <Skeleton variant='rectangular' height={300} />
        </Stack>
      </Stack>

      {/* Simulating Planning Hub */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mt: 2 }}>
        {/* Left Panel */}
        <Box sx={{ width: '20%' }}>
          <Skeleton variant='rectangular' height={150} />
          <Stack spacing={1} sx={{ mt: 1 }}>
            <Skeleton variant='text' width='50%' />
            <Skeleton variant='rectangular' height={100} />
            <Skeleton variant='rectangular' height={100} />
          </Stack>
        </Box>

        {/* Right Panel */}
        <Skeleton variant='rectangular' width='100%' height={200} />
      </Stack>

      {/* Simulating Footer */}
      <Skeleton variant='rectangular' width='100%' height={30} sx={{ mt: 2 }} />
    </Box>
  );
}
