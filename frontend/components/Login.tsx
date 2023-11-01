import React from 'react';
import styled from 'styled-components';

// Styling for the login button
const StyledButton = styled.button`
  background-color: #007bff;
  border: none;
  color: white;
  padding: 12px 24px;
  text-align: center;
  font-size: 18px;
  transition: 0.3s;
  border-radius: 12px;
  cursor: pointer;
  
  &:hover {
    background-color: #0056b3;
    transform: scale(1.1);
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const Login: React.FC<{ setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>> }> = ({ setIsLoggedIn }) => {
  const handleLogin = async () => {
    window.location.href = `http://localhost:8000/login`;
    const response = await fetch('http://localhost:8000/authenticated'); 
    const data = await response.json();
    if (data.authenticated) {
      setIsLoggedIn(true);
    }
  };

  return (
    <StyledButton onClick={handleLogin}>
      Log In
    </StyledButton>
  );
};

export default Login;
