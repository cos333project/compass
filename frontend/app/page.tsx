'use client';

import { useState, useEffect } from 'react';
import { ApolloProvider } from '@apollo/client';
import { useAuth } from './utils/Auth';
import { AuthProvider } from './utils/Auth';
import client from './apolloClient';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Footer from '../components/Footer';

const Root = () => {
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <Home />
      </AuthProvider>
    </ApolloProvider>
  );
};

const Home = () => {
  const { setIsLoggedIn } = useAuth();

  useEffect(() => {
    console.log("Home component mounted");

    fetch('http://localhost:8000/authenticated')
      .then(response => response.json())
      .then(data => setIsLoggedIn(data.authenticated))
      .catch(error => console.error("Couldn't fetch auth state:", error));
  
    return () => {
      console.log("Home component will unmount");
    };
  }, []);

  return (
    <>
      <Navbar />
      <Hero />
      <Footer />
    </>
  );
};

export default Root;
