import React from 'react';

function LoadingComponent() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <span className="loading loading-ring loading-lg"></span>
    </div>
  );
}

export default LoadingComponent;
