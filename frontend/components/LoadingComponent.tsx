import React from 'react';

// Define the keyframes for the animation
const spinKeyframes = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Define the styles for the loader
const loaderStyle: React.CSSProperties = {
  border: '16px solid #f3f3f3', // Light grey
  borderTop: '16px solid #3498db', // Blue color
  borderRadius: '50%',
  width: '120px',
  height: '120px',
  animation: 'spin 2s linear infinite',
};

// LoadingComponent definition
const LoadingComponent: React.FC = () => {
  return (
    <>
      <style>{spinKeyframes}</style>
      <div style={loaderStyle}></div>
    </>
  );
}

export default LoadingComponent;
