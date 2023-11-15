'use client';

import { useEffect } from 'react';

import Footer from '../components/Footer';
import Hero from '../components/Hero';
import Navbar from '../components/Navbar';
import useAuthStore from '../store/authSlice';

const Root = () => {
  return (
    // Apply Zustand client store here if necessary
    <Home />
  );
};

const Home = () => {
  const { checkAuthentication } = useAuthStore();
  
  useEffect(() => {
    checkAuthentication();
  }, [checkAuthentication]);
  

  return (
    <>
      <Navbar />
      <Hero />
      <Footer />
    </>
  );
};

export default Root;
