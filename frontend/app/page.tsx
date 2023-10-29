'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ApolloProvider } from '@apollo/client';
import { Provider as ReduxProvider } from 'react-redux';
import store from '../store/store';
import client from './apolloClient';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Footer from '../components/Footer';
import { AppDispatch } from '../store/store';
import { checkAuthentication } from '../store/authSlice';

const Root = () => {
  return (
    <ApolloProvider client={client}>
      <ReduxProvider store={store}>
        <Home />
      </ReduxProvider>
    </ApolloProvider>
  );
};

const Home = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(checkAuthentication());
  }, []);

  return (
    <>
      <Navbar/>
      <Hero />
      <Footer />
    </>
  );
};

export default Root;
