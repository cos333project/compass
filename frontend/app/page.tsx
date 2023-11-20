'use client';
import { useEffect } from 'react';

import Hero from '../components/Hero';
import Navbar from '../components/Navbar';
import useAuthStore from '../store/authSlice';

const Home = () => {
  const { checkAuthentication } = useAuthStore();
  useEffect(() => {
    checkAuthentication();
  }, [checkAuthentication]);
  return (
    <>
      <Navbar />
      <Hero />
    </>
  );
};

export default Home;
