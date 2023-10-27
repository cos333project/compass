'use client';

let ApolloProvider: any;
import('@apollo/client').then(module => {
  ApolloProvider = module.ApolloProvider;
});
import { Provider as ReduxProvider } from 'react-redux';
import { useState, useEffect } from 'react';
import store from '../store/store';
import client from './apolloClient';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero'
import Footer from '../components/Footer'

export default function Home() {
  const [auth, setAuth] = useState<{ isAuthenticated: boolean; username: string | null }>({ isAuthenticated: false, username: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:9000/is_authenticated') // Change once this goes to production
      .then((res) => res.json())
      .then((data) => setAuth({ isAuthenticated: data.authenticated, username: data.username }))
      .catch((err) => console.error(`Auth check failed: ${err}`));
  }, []);

  if (loading) return null; // Need to make this a cool loader page while user waits for auth check

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
