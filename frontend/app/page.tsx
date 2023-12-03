'use client';
import { useEffect } from 'react';

import Footer from '../components/Footer';
import Hero from '../components/Hero';
import Navbar from '../components/Navbar';
import useAuthStore from '../store/authSlice';

const Home = () => {
  const { checkAuthentication } = useAuthStore();

  useEffect(() => {
    checkAuthentication();
  }, []);

  return (
    <>
      <Navbar />
      <Hero />
      <Footer />
    </>
  );
};

export default Home;
