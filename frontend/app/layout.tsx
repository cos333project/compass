import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { GeistSans, GeistMono } from 'geist/font';
import { ApolloProvider } from '@apollo/client';
import { AuthProvider } from './utils/Auth';  // Adjust the path as needed
import client from './apolloClient';  // Adjust the path as needed

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Compass',
  description: 'Princeton All In One',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <AuthProvider>
        <html lang="en" className={GeistSans.className}>
          <body>{children}</body>
        </html>
      </AuthProvider>
  );
}
