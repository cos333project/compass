'use client';

import { useEffect } from 'react';
import { ApolloProvider } from '@apollo/client';
import useAuthStore from '../store/authSlice';
import client from './apolloClient';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Footer from '../components/Footer';

const Root = () => {
  return (
    <ApolloProvider client={client}>
        <Home />
    </ApolloProvider>
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
