import React from 'react';
import Skeleton from '@mui/joy/Skeleton';
import { CssVarsProvider, extendTheme } from '@mui/joy/styles';

const theme = extendTheme({
  components: {
    JoySkeleton: {
      styleOverrides: {
        root: {
          // Increase specificity here
          '&&': {
            backgroundColor: '#f6f6f6', 
            animation: 'none', 
          },
        },
      },
    },
  },
});

function SkeletonApp() {
  return (
    <CssVarsProvider theme={theme}>
      <div style={{ display: 'flex', width: '100vw', height: '100vh' }}>
        {/* Body container */}
        <div style={{ display: 'flex', width: '100%', height: '100%' }}>
          {/* Left sidebar with search bar */}
          <div style={{ width: '25%', marginRight: '12px', marginLeft: '12px' }}>
            <Skeleton variant="rectangular" height="110px" style={{ marginTop: '10px' }} />
            <Skeleton variant="rectangular" height="calc(100vh - 110px)" style={{ marginTop: '2px' }} />
          </div>
          
          {/* Middle 2x4 grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridAutoRows: '1fr', gap: '25px', width: '46%', marginTop: '10px', marginLeft: '10px' }}>
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} variant="rectangular" height="155px" />
            ))}
          </div>

          {/* Right large vertical space */}
          <div style={{ width: '20%' }}>
            {/* This space is intentionally left blank */}
          </div>
        </div>
      </div>
    </CssVarsProvider>
  );
}

export default SkeletonApp;
