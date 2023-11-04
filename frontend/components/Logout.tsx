import React from 'react';
import useAuthStore from '../store/authSlice';
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

const Logout: React.FC = () => {
  const setIsLoggedIn = useAuthStore((state) => state.setIsLoggedIn);

  const handleLogout = () => {
    window.location.href = `http://localhost:8000/logout`;
  };

  return <StyledButton onClick={handleLogout}>Log Out</StyledButton>;
};

export default Logout;