import './globals.scss';
import { GeistSans } from 'geist/font/sans';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Compass',
  description: 'Princeton All In One',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' className={GeistSans.className}>
      <body>{children}</body>
    </html>
  );
}
