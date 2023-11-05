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
  const checkAuthentication = useAuthStore((state) => state.checkAuthentication);
  const setIsAuthenticated = useAuthStore((state) => state.setIsAuthenticated);
  
  useEffect(() => {
    console.log("Home component mounted");

    fetch('http://localhost:8000/authenticate')
      .then(response => response.json())
      .then(data => setIsAuthenticated(data.authenticated))
      .catch(error => console.error("Couldn't fetch auth state:", error));

    return () => {
      console.log("Home component will unmount");
    };
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
