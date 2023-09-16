'use client'
import { ApolloProvider } from '@apollo/client';
import Navbar from './components/Navbar';
import Hero from './components/Hero'

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
    </>

  )
}
