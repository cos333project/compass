'use client';
import { useEffect } from 'react';

import Hero from '../components/Hero';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
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
      <Footer />
    </>
  );
};

export default Home;
