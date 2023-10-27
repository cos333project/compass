import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { Settings } from 'react-native';
import * as dotenv from 'dotenv';

dotenv.config()

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

// Assume handleLogin is the function we use to trigger the CAS authentication
const Login: React.FC = () => {
  const handleLogin = () => {
    // const CAS_URL = process.env.CAS_URL;
    // console.log(`${CAS_URL}`);
    const CAS_URL = process.env.NEXT_PUBLIC_CAS_URL;
    window.location.href = CAS_URL!;
  };

  return (
    <StyledButton onClick={handleLogin}>
      Login
    </StyledButton>
  );
};

export default Login;
