'use client';

import { useEffect } from 'react';
import { ApolloProvider } from '@apollo/client';
import Authorize from '../store/authSlice';
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
  const setIsLoggedIn = Authorize(state => state.setIsLoggedIn);

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
