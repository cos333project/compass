import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { GeistSans, GeistMono } from 'geist/font'


export const metadata: Metadata = {
  title: 'Compass',
  description: 'Princeton All In One',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
