'use client'
import { ApolloProvider } from '@apollo/client';
import { Provider as ReduxProvider } from 'react-redux';
import store from '../store/store';
import client from './apolloClient';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero'
import Footer from '../components/Footer'

export default function Home() {
  return (
    <ApolloProvider client={client}>
      <ReduxProvider store={store}>
        <>
          <Navbar />
          <Hero />
          <Footer />
        </>
      </ReduxProvider>
    </ApolloProvider>
  );
}