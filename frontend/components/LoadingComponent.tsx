import React from 'react';

// Define the keyframes for the bubble animation
const bubbleAnimation = `
  @keyframes bubble {
    0%, 80%, 100% {
      transform: scale(0);
    }
    40% {
      transform: scale(1);
    }
  }
`;

// Define the styles for the container
const containerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh', // Full viewport height
};

// Define the styles for the loader and bubbles
const loaderStyle: React.CSSProperties = {
  position: 'relative',
  width: '80px',
  height: '80px',
};

const bubbleStyle = (index: number): React.CSSProperties => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  borderRadius: '50%',
  backgroundColor: 'black', // Color of the bubbles
  opacity: 0.6,
  top: 0,
  left: 0,
  transform: 'scale(0)',
  animation: `bubble 1.4s infinite ease-in-out both`,
  animationDelay: `${index * 0.2}s`, // Stagger the animation of each bubble
});

// LoadingComponent definition
const LoadingComponent: React.FC = () => {
  return (
    <div style={containerStyle}>
      <style>{bubbleAnimation}</style>
      <div style={loaderStyle}>
        {[...Array(3)].map((_, index) => (
          <div key={index} style={bubbleStyle(index)}></div>
        ))}
      </div>
    </div>
  );
}

export default LoadingComponent;
